import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);

  console.log("Deploying ArcMOQ with:", deployer.address);
  console.log("Chain ID:", chainId);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  const isArc = chainId === 5042002;

  // Arc Testnet official addresses
  const ARC_USDC = "0x3600000000000000000000000000000000000000";
  const ARC_EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

  let usdcAddress: string;
  let eurcAddress: string;
  let mockMode = false;

  if (isArc) {
    usdcAddress = ARC_USDC;
    eurcAddress = ARC_EURC;
    console.log("Using Arc Testnet USDC + EURC");
  } else {
    mockMode = true;
    const Mock = await ethers.getContractFactory("MockERC20");
    const usdc = await Mock.deploy("Mock USDC", "USDC", 6);
    await usdc.waitForDeployment();
    const eurc = await Mock.deploy("Mock EURC", "EURC", 6);
    await eurc.waitForDeployment();
    usdcAddress = await usdc.getAddress();
    eurcAddress = await eurc.getAddress();
    console.log("MockUSDC:", usdcAddress);
    console.log("MockEURC:", eurcAddress);

    // Seed deployer
    await (await usdc.faucet(deployer.address, ethers.parseUnits("1000000", 6))).wait();
    await (await eurc.faucet(deployer.address, ethers.parseUnits("1000000", 6))).wait();
  }

  const Adapter = await ethers.getContractFactory("StableFXAdapter");
  const adapter = await Adapter.deploy(usdcAddress, eurcAddress, deployer.address);
  await adapter.waitForDeployment();
  const adapterAddress = await adapter.getAddress();
  console.log("StableFXAdapter:", adapterAddress);

  // Seed EURC liquidity into adapter
  const eurc = await ethers.getContractAt(
    mockMode ? "MockERC20" : ["function approve(address,uint256) returns (bool)", "function balanceOf(address) view returns (uint256)"],
    eurcAddress
  );

  if (mockMode) {
    const seed = ethers.parseUnits("500000", 6);
    await (await eurc.approve(adapterAddress, seed)).wait();
    await (await adapter.seedEURC(seed)).wait();
  } else {
    // On Arc: seed whatever EURC the deployer holds (minus dust)
    const bal: bigint = await (eurc as any).balanceOf(deployer.address);
    if (bal > 0n) {
      const seed = bal > ethers.parseUnits("1", 6) ? bal - ethers.parseUnits("0.1", 6) : bal;
      await (await (eurc as any).approve(adapterAddress, seed)).wait();
      await (await adapter.seedEURC(seed)).wait();
      console.log("Seeded EURC liquidity:", ethers.formatUnits(seed, 6));
    } else {
      console.warn("WARNING: No EURC balance to seed adapter. Fund deployer with EURC from faucet.");
    }
  }

  const GroupOrder = await ethers.getContractFactory("GroupOrder");
  const groupOrder = await GroupOrder.deploy(
    usdcAddress,
    eurcAddress,
    adapterAddress,
    deployer.address,
    deployer.address
  );
  await groupOrder.waitForDeployment();
  const groupOrderAddress = await groupOrder.getAddress();
  console.log("GroupOrder:", groupOrderAddress);

  const WarehouseReceipt = await ethers.getContractFactory("WarehouseReceipt");
  const receipt = await WarehouseReceipt.deploy(deployer.address, deployer.address, deployer.address);
  await receipt.waitForDeployment();
  const receiptAddress = await receipt.getAddress();
  console.log("WarehouseReceipt:", receiptAddress);

  // Demo supplier wallet
  const supplier = ethers.Wallet.createRandom().connect(ethers.provider);
  // On local we don't need to fund supplier for receiving EURC
  await (await groupOrder.setSupplierWhitelist(supplier.address, true)).wait();

  // Demo buyer wallets (local)
  const buyers = [];
  for (let i = 0; i < 5; i++) {
    const w = ethers.Wallet.createRandom();
    buyers.push({ name: ["Restaurant A", "Restaurant B", "Hotel C", "Grocery D", "Catering E"][i], address: w.address, privateKey: w.privateKey });
  }

  const out = {
    network: isArc ? "arcTestnet" : "local",
    chainId,
    rpcUrl: isArc ? "https://rpc.testnet.arc.io" : "http://127.0.0.1:8545",
    explorer: isArc ? "https://testnet.arcscan.app" : "",
    deployer: deployer.address,
    agent: deployer.address,
    attestationSigner: deployer.address,
    labels: {
      aedCollection: "Simulated PSP",
      arcSettlement: isArc ? "Live Testnet" : "Local Mock",
      supplierQuotes: "Sandbox",
      stableFX: "Adapter Mode",
      warehouseAttestation: "Demo Verifier",
    },
    tokens: {
      USDC: usdcAddress,
      EURC: eurcAddress,
      mockMode,
    },
    contracts: {
      StableFXAdapter: adapterAddress,
      GroupOrder: groupOrderAddress,
      WarehouseReceipt: receiptAddress,
    },
    supplier: {
      id: "oliva-sur",
      name: "Oliva Sur Cooperativa",
      address: supplier.address,
      privateKey: mockMode ? supplier.privateKey : undefined,
    },
    buyers,
    arcOfficial: {
      USDC: ARC_USDC,
      EURC: ARC_EURC,
      StableFX_FxEscrow: "0xd68256f4D69C6BbEcB873D8588AE0Dc6B8E22E10",
    },
    deployedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "..", "..", "deployed-addresses.json");
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  fs.writeFileSync(path.join(__dirname, "..", "deployed-addresses.json"), JSON.stringify(out, null, 2));
  console.log("Wrote deployed-addresses.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
