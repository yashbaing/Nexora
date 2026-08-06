import { ethers } from "ethers";
import {
  loadDeployed,
  GROUP_ORDER_ABI,
  RECEIPT_ABI,
  ERC20_ABI,
  FX_ABI,
  BUYERS_DEMO,
  aedToUsdc,
} from "./config";
import {
  resetEvents,
  matchDemand,
  researchSuppliers,
  negotiate,
  policyValidate,
  getEvents,
  push,
} from "./agent";

export type DemoState = {
  status: "idle" | "running" | "complete" | "error";
  orderId?: number;
  batchId?: number;
  txs: { label: string; hash: string; explorer?: string }[];
  settlement?: Record<string, unknown>;
  receipt?: Record<string, unknown>;
  buyers?: {
    name: string;
    address: string;
    quantity: number;
    maxAED: number;
    fundedUSDC: string;
    estimatedAED: number;
  }[];
  error?: string;
  events: ReturnType<typeof getEvents>;
};

let demoState: DemoState = { status: "idle", txs: [], events: [] };

export function getDemoState() {
  return { ...demoState, events: getEvents() };
}

function agentPrivateKey(chainId: number): string {
  const pk = process.env.AGENT_PRIVATE_KEY || process.env.PRIVATE_KEY || process.env.ARC_PRIVATE_KEY;
  if (pk) return pk;
  if (chainId === 31337) {
    return "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
  }
  throw new Error("AGENT_PRIVATE_KEY / PRIVATE_KEY required for Arc Testnet");
}

export async function runFullDemo(): Promise<DemoState> {
  resetEvents();
  demoState = { status: "running", txs: [], events: [] };

  try {
    const cfg = loadDeployed();
    const provider = new ethers.JsonRpcProvider(cfg.rpcUrl, cfg.chainId, { staticNetwork: true });
    const wallet = new ethers.Wallet(agentPrivateKey(cfg.chainId), provider);

    const usdc = new ethers.Contract(cfg.tokens.USDC, ERC20_ABI, wallet);
    const group = new ethers.Contract(cfg.contracts.GroupOrder, GROUP_ORDER_ABI, wallet);
    const receipt = new ethers.Contract(cfg.contracts.WarehouseReceipt, RECEIPT_ABI, wallet);
    const fx = new ethers.Contract(cfg.contracts.StableFXAdapter, FX_ABI, wallet);
    const explorer = cfg.explorer;

    const send = async (label: string, fn: (nonce: number) => Promise<ethers.ContractTransactionResponse>) => {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const nonce = await wallet.getNonce("pending");
          const tx = await fn(nonce);
          const mined = await provider.waitForTransaction(tx.hash, 1, 60_000);
          const hash = mined?.hash || tx.hash;
          demoState.txs.push({
            label,
            hash,
            explorer: explorer ? `${explorer}/tx/${hash}` : undefined,
          });
          push("chain", label, explorer ? `${explorer}/tx/${hash}` : hash, { hash });
          return hash;
        } catch (e: any) {
          const msg = e?.shortMessage || e?.message || "";
          if (attempt < 2 && /nonce|NONCE|already been used|replacement/i.test(msg)) {
            await new Promise((r) => setTimeout(r, 150));
            continue;
          }
          throw e;
        }
      }
      throw new Error(`failed to send ${label}`);
    };

    const demand = matchDemand();
    const ranked = researchSuppliers(demand.totalDemand);
    const nego = negotiate(demand.totalDemand, ranked);
    if (!nego.accepted) throw new Error("Negotiation failed");

    const unitEURC = ethers.parseUnits(nego.response.unitPriceEUR.toFixed(6), 6);
    const qty = BigInt(nego.response.newMOQ);
    const totalEURC = qty * unitEURC;

    let usdcBudget = totalEURC;
    for (let i = 0; i < 8; i++) {
      const [out] = await fx.quote(usdcBudget);
      if (out >= totalEURC) break;
      usdcBudget = (usdcBudget * 1005n) / 1000n;
    }
    usdcBudget = (usdcBudget * 1002n) / 1000n;

    push(
      "fx",
      "Requested FX quote (StableFX Adapter Mode)",
      `Need ${ethers.formatUnits(totalEURC, 6)} EURC · budget ${ethers.formatUnits(usdcBudget, 6)} USDC`,
      {
        totalEURC: ethers.formatUnits(totalEURC, 6),
        usdcBudget: ethers.formatUnits(usdcBudget, 6),
      }
    );

    policyValidate({
      supplierWhitelisted: true,
      offerExpired: false,
      totalFundedUSDC: Number(ethers.formatUnits(usdcBudget, 6)),
      requiredUSDC: Number(ethers.formatUnits(usdcBudget, 6)),
      buyersWithinMandate: true,
      deliveryOk: true,
      fxSlippageBps: 10,
      maxSlippageBps: 200,
      destinationApproved: true,
    });

    if (cfg.tokens.mockMode) {
      const bal: bigint = await usdc.balanceOf(wallet.address);
      if (bal < ethers.parseUnits("100000", 6)) {
        await send("faucetUSDC", (nonce) =>
          usdc.faucet(wallet.address, ethers.parseUnits("1000000", 6), { nonce })
        );
      }
    }

    const now = Math.floor(Date.now() / 1000);
    const orderExpiry = now + 86400 * 7;
    const deliveryDeadline = now + 86400 * 55;

    await send("createOrder", (nonce) =>
      group.createOrder(
        "Extra Virgin Olive Oil",
        "Jaén, Spain",
        "5-liter tins",
        demand.totalDemand,
        1000,
        orderExpiry,
        { nonce }
      )
    );
    const orderId = Number(await group.nextOrderId()) - 1;
    demoState.orderId = orderId;

    await send("whitelistSupplier", (nonce) =>
      group.setSupplierWhitelist(cfg.supplier.address, true, { nonce })
    );

    const buyerRecords: {
      name: string;
      address: string;
      quantity: number;
      maxAED: number;
      maxUSDC: bigint;
      fundUSDC: bigint;
    }[] = [];

    for (let i = 0; i < BUYERS_DEMO.length; i++) {
      const b = BUYERS_DEMO[i];
      const address = i === 0 ? wallet.address : cfg.buyers[i]?.address || ethers.Wallet.createRandom().address;
      const maxUSDC = aedToUsdc(b.maxAED);
      const share = (usdcBudget * BigInt(b.quantity)) / BigInt(demand.totalDemand);
      let fundUSDC = share + (share * 15n) / 1000n;
      if (fundUSDC > maxUSDC) fundUSDC = maxUSDC;
      if (fundUSDC < share) fundUSDC = share;
      buyerRecords.push({
        name: b.name,
        address,
        quantity: b.quantity,
        maxAED: b.maxAED,
        maxUSDC: maxUSDC > fundUSDC ? maxUSDC : fundUSDC + ethers.parseUnits("50", 6),
        fundUSDC,
      });
    }

    let fundedSum = buyerRecords.reduce((s, b) => s + b.fundUSDC, 0n);
    if (fundedSum < usdcBudget) {
      let need = usdcBudget - fundedSum;
      for (const b of buyerRecords) {
        if (need <= 0n) break;
        const room = b.maxUSDC - b.fundUSDC;
        const add = room < need ? room : need;
        b.fundUSDC += add;
        if (b.fundUSDC > b.maxUSDC) b.maxUSDC = b.fundUSDC;
        need -= add;
      }
    }

    for (const b of buyerRecords) {
      await send(`join:${b.name}`, (nonce) =>
        group.joinOrderFor(
          orderId,
          b.address,
          b.quantity,
          b.maxUSDC,
          deliveryDeadline,
          200,
          b.name,
          { nonce }
        )
      );
      await send(`kyb:${b.name}`, (nonce) => receipt.setKYB(b.address, true, { nonce }));
    }

    fundedSum = buyerRecords.reduce((s, b) => s + b.fundUSDC, 0n);
    await send("approveUSDC", (nonce) => usdc.approve(cfg.contracts.GroupOrder, fundedSum, { nonce }));

    for (const b of buyerRecords) {
      await send(`fund:${b.name}`, (nonce) =>
        group.fundMandateFor(orderId, b.address, b.fundUSDC, { nonce })
      );
    }

    const offerExpiry = now + 600;
    const termsHash = ethers.keccak256(
      ethers.toUtf8Bytes(
        JSON.stringify({
          supplierId: nego.counterOffer.supplierId,
          quantity: Number(qty),
          unitPriceEUR: nego.counterOffer.unitPriceEUR,
          paymentCurrency: "EURC",
          paymentTiming: "immediate",
          recurringIntent: "monthly",
        })
      )
    );

    await send("submitOffer", (nonce) =>
      group.submitSupplierOffer(
        orderId,
        cfg.supplier.address,
        nego.counterOffer.supplierId,
        qty,
        unitEURC,
        usdcBudget,
        offerExpiry,
        termsHash,
        { nonce }
      )
    );

    const [policyOk, policyReason] = await group.policyCheck(orderId);
    push(
      "policy_onchain",
      policyOk ? "On-chain policyCheck passed" : "On-chain policyCheck failed",
      String(policyReason),
      { policyOk, policyReason }
    );
    if (!policyOk) throw new Error(`On-chain policy failed: ${policyReason}`);

    await send("acceptOffer", (nonce) => group.acceptSupplierOffer(orderId, { nonce }));
    push("settle", "Executing supplier settlement", "USDC pool → StableFX Adapter → EURC to Spanish supplier");
    await send("executeSettlement", (nonce) => group.executeSettlement(orderId, { nonce }));

    const settled = await group.getOrder(orderId);

    for (const b of buyerRecords) {
      try {
        await send(`release:${b.name}`, (nonce) =>
          group.releaseUnusedFundsFor(orderId, b.address, { nonce })
        );
      } catch {
        /* exact spend */
      }
    }

    await send("createBatch", (nonce) =>
      receipt.createBatch(
        "EVOO-ES-UAE-001",
        "Extra Virgin Olive Oil",
        "Jaén, Spain",
        "5-liter tins",
        cfg.supplier.name,
        wallet.address,
        Number(qty),
        orderId,
        { nonce }
      )
    );
    const batchId = Number(await receipt.nextBatchId()) - 1;
    demoState.batchId = batchId;

    for (const b of buyerRecords) {
      await send(`alloc:${b.name}`, (nonce) =>
        receipt.registerAllocation(batchId, b.address, b.quantity, { nonce })
      );
    }

    push(
      "docs",
      "Shipping documents uploaded — AI extracted fields",
      "Invoice INV-ES-88421 · Packing list PL-860-TIN · BoL BOL-VALENCIA-DXB-9921 · Qty 860 · Batch EVOO-ES-UAE-001",
      { note: "AI extracts data but is not the attestation authority" }
    );

    const attestation = ethers.keccak256(
      ethers.toUtf8Bytes("INV-ES-88421|PL-860-TIN|BOL-VALENCIA-DXB-9921|EVOO-ES-UAE-001|860")
    );
    push(
      "attest",
      "Warehouse attestation verified (Demo Verifier)",
      "Trusted custodian signed shipment attestation — receipts may now be minted",
      { attestationHash: attestation }
    );
    await send("verifyBatch", (nonce) => receipt.verifyBatch(batchId, attestation, { nonce }));
    await send("mintReceipts", (nonce) => receipt.mintAllAllocations(batchId, { nonce }));

    const batch = await receipt.getBatch(batchId);
    const allocs = await receipt.getAllocations(batchId);

    demoState.buyers = buyerRecords.map((b) => {
      const share = Number(ethers.formatUnits((usdcBudget * BigInt(b.quantity)) / qty, 6));
      return {
        name: b.name,
        address: b.address,
        quantity: b.quantity,
        maxAED: b.maxAED,
        fundedUSDC: ethers.formatUnits(b.fundUSDC, 6),
        estimatedAED: Math.round(share * 3.6725),
      };
    });

    demoState.settlement = {
      orderId,
      status: "Settled",
      pooledUSDC: ethers.formatUnits(settled.settledUSDC, 6),
      eurcPaid: ethers.formatUnits(settled.settledEURC, 6),
      supplier: cfg.supplier.address,
      supplierName: cfg.supplier.name,
      unitPriceEUR: nego.response.unitPriceEUR,
      quantity: Number(qty),
      originalMOQ: 1000,
      renegotiatedMOQ: Number(qty),
      fx: {
        mode: "StableFX: Adapter Mode",
        note: "Does not convert AED→USDC. AED collection is Simulated PSP.",
      },
      labels: cfg.labels,
    };

    demoState.receipt = {
      batchId,
      batchCode: batch.batchCode,
      productName: batch.productName,
      origin: batch.origin,
      packaging: batch.packaging,
      supplier: batch.supplier,
      totalQuantity: Number(batch.totalQuantity),
      mintedQuantity: Number(batch.mintedQuantity),
      status: "Verified",
      attestationHash: batch.attestationHash,
      allocations: allocs.map((a: any, i: number) => ({
        name: buyerRecords[i]?.name,
        buyer: a.buyer,
        quantity: Number(a.quantity),
        minted: a.minted,
        redeemed: Number(a.redeemed),
      })),
    };

    demoState.status = "complete";
    demoState.events = getEvents();
    return getDemoState();
  } catch (e: any) {
    console.error(e);
    demoState.status = "error";
    demoState.error = e.shortMessage || e.reason || e.message || String(e);
    demoState.events = getEvents();
    return getDemoState();
  }
}

export async function redeemRestaurantA(quantity = 100) {
  const cfg = loadDeployed();
  const provider = new ethers.JsonRpcProvider(cfg.rpcUrl, cfg.chainId, { staticNetwork: true });
  const wallet = new ethers.Wallet(agentPrivateKey(cfg.chainId), provider);
  const receipt = new ethers.Contract(cfg.contracts.WarehouseReceipt, RECEIPT_ABI, wallet);

  const batchId = demoState.batchId ?? Number(await receipt.nextBatchId()) - 1;
  const bal: bigint = await receipt.balanceOf(wallet.address, batchId);
  if (bal === 0n) throw new Error("No receipt balance for Restaurant A (agent wallet)");
  const qty = bal < BigInt(quantity) ? Number(bal) : quantity;

  const req = await receipt.requestRedemption(batchId, qty);
  await provider.waitForTransaction(req.hash, 1, 60_000);
  const conf = await receipt.confirmRedemption(batchId, wallet.address, qty);
  const mined = await provider.waitForTransaction(conf.hash, 1, 60_000);
  const hash = mined?.hash || conf.hash;

  push(
    "redeem",
    "Restaurant A redeemed warehouse receipts",
    `${qty} receipt units burned → ${qty} physical 5L tins released`,
    { batchId, quantity: qty, txHash: hash }
  );

  return {
    batchId,
    buyer: wallet.address,
    quantity: qty,
    txHash: hash,
    explorer: cfg.explorer ? `${cfg.explorer}/tx/${hash}` : undefined,
    burned: true,
  };
}

export function getConfigPublic() {
  const cfg = loadDeployed();
  return {
    ...cfg,
    supplier: { id: cfg.supplier.id, name: cfg.supplier.name, address: cfg.supplier.address },
    buyers: (cfg.buyers || []).map((b) => ({ name: b.name, address: b.address })),
  };
}
