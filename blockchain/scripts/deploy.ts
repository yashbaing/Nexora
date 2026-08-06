import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

const ARC_USDC = "0x3600000000000000000000000000000000000000";
const ARC_EURC = "0x89B50855Aa3bE2F677cD6303Cec089B5F319D72a";

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = Number(network.chainId);
  const isArc = chainId === 5042002;

  console.log(`Deploying ArcMOQ with ${deployer.address} on chain ${chainId}`);

  let usdcAddress: string;
  let eurcAddress: string;

  if (isArc) {
    usdcAddress = ARC_USDC;
    eurcAddress = ARC_EURC;
    console.log("Using Arc Testnet USDC + EURC");
  } else {
    const Mock = await ethers.getContractFactory("MockERC20");
    const usdc = await Mock.deploy("USD Coin", "USDC", 6);
    await usdc.waitForDeployment();
    const eurc = await Mock.deploy("Euro Coin", "EURC", 6);
    await eurc.waitForDeployment();
    usdcAddress = await usdc.getAddress();
    eurcAddress = await eurc.getAddress();
    console.log("Mock USDC:", usdcAddress);
    console.log("Mock EURC:", eurcAddress);

    // Seed balances for local demo
    const mintAmt = ethers.parseUnits("1000000", 6);
    await (await usdc.mint(deployer.address, mintAmt)).wait();
    await (await eurc.mint(deployer.address, mintAmt)).wait();
  }

  const agent = process.env.AGENT_ADDRESS || deployer.address;
  const warehouse = process.env.WAREHOUSE_ADDRESS || deployer.address;

  const GroupOrder = await ethers.getContractFactory("GroupOrder");
  const groupOrder = await GroupOrder.deploy(usdcAddress, eurcAddress, agent, deployer.address);
  await groupOrder.waitForDeployment();
  const groupOrderAddress = await groupOrder.getAddress();
  console.log("GroupOrder:", groupOrderAddress);

  const StableFXAdapter = await ethers.getContractFactory("StableFXAdapter");
  // ~0.92 EURC per USDC demo rate (EUR stronger)
  const adapter = await StableFXAdapter.deploy(usdcAddress, eurcAddress, 920_000n, deployer.address);
  await adapter.waitForDeployment();
  const adapterAddress = await adapter.getAddress();
  console.log("StableFXAdapter:", adapterAddress);

  const WarehouseReceipt = await ethers.getContractFactory("WarehouseReceipt");
  const receipt = await WarehouseReceipt.deploy(deployer.address, warehouse);
  await receipt.waitForDeployment();
  const receiptAddress = await receipt.getAddress();
  console.log("WarehouseReceipt:", receiptAddress);

  await (await groupOrder.setFxAdapter(adapterAddress)).wait();
  await (await groupOrder.setWarehouseReceipt(receiptAddress)).wait();
  await (await receipt.setGroupOrder(groupOrderAddress)).wait();

  // Seed EURC liquidity into adapter for demo settlement
  const eurc = await ethers.getContractAt(
    isArc ? ["function approve(address,uint256) returns (bool)", "function balanceOf(address) view returns (uint256)", "function transfer(address,uint256) returns (bool)"] : "MockERC20",
    eurcAddress
  );

  if (!isArc) {
    const liquidity = ethers.parseUnits("500000", 6);
    await (await eurc.approve(adapterAddress, liquidity)).wait();
    await (await adapter.depositEURC(liquidity)).wait();
    console.log("Seeded adapter EURC liquidity:", liquidity.toString());
  } else {
    const bal = await eurc.balanceOf(deployer.address);
    if (bal > 0n) {
      const liquidity = bal / 2n;
      await (await eurc.approve(adapterAddress, liquidity)).wait();
      await (await adapter.depositEURC(liquidity)).wait();
      console.log("Seeded adapter with Arc EURC:", liquidity.toString());
    } else {
      console.warn("No EURC balance — fund via faucet.circle.com and call depositEURC");
    }
  }

  // Demo supplier: Oliva Sur (Spain)
  const supplier = process.env.SUPPLIER_ADDRESS || deployer.address;
  const supplierWallet = process.env.SUPPLIER_WALLET || deployer.address;
  await (await groupOrder.setSupplierWhitelist(supplier, true)).wait();
  await (await groupOrder.setSettlementWallet(supplierWallet, true)).wait();

  // Create olive oil group order
  const expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  const tx = await groupOrder.createOrder(
    "EVOO-ES-UAE-001",
    "Extra Virgin Olive Oil",
    "Jaén, Spain",
    "5-liter tins",
    860,
    1000,
    expiry
  );
  await tx.wait();
  console.log("Created group order #1: Extra Virgin Olive Oil");

  const addresses = {
    network: isArc ? "arcTestnet" : "local",
    chainId,
    rpcUrl: isArc ? "https://rpc.testnet.arc.io" : "http://127.0.0.1:8545",
    explorer: isArc ? "https://testnet.arcscan.app" : null,
    deployer: deployer.address,
    agent,
    warehouse,
    supplier,
    supplierWallet,
    USDC: usdcAddress,
    EURC: eurcAddress,
    GroupOrder: groupOrderAddress,
    StableFXAdapter: adapterAddress,
    WarehouseReceipt: receiptAddress,
    labels: {
      aedCollection: "Simulated PSP",
      arcSettlement: isArc ? "Live Testnet" : "Local Hardhat",
      supplierQuotes: "Sandbox",
      stableFx: "Test or Adapter Mode",
      warehouseAttestation: "Demo Verifier",
    },
    deployedAt: new Date().toISOString(),
  };

  const outPath = path.join(__dirname, "../../deployed-addresses.json");
  fs.writeFileSync(outPath, JSON.stringify(addresses, null, 2));
  fs.writeFileSync(path.join(__dirname, "../deployed-addresses.json"), JSON.stringify(addresses, null, 2));
  console.log("Wrote deployed-addresses.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
