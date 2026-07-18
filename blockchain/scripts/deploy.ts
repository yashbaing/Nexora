import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying contracts with deployer:", deployer.address);

  // 1. Deploy MockUSDC
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  const usdcAddr = await mockUSDC.getAddress();
  console.log("💵 MockUSDC deployed to:", usdcAddr);

  // 2. Oracle Signer address
  // For local testing, we can use the deployer address or another known test address
  // Let's use the first default address as the oracle signer for simplicity, or we can configure it.
  const oracleAddress = deployer.address;
  console.log("🔮 Oracle Signer address set to:", oracleAddress);

  // 3. Deploy StockwavePlatform
  const StockwavePlatform = await ethers.getContractFactory("StockwavePlatform");
  const platform = await StockwavePlatform.deploy(usdcAddr, oracleAddress);
  await platform.waitForDeployment();
  const platformAddr = await platform.getAddress();
  console.log("🏛️ StockwavePlatform deployed to:", platformAddr);

  // 4. Deploy and register Stock Tokens
  const stockSymbols = [
    { symbol: "xAAPL", name: "Tokenized Apple Inc." },
    { symbol: "xTSLA", name: "Tokenized Tesla Inc." },
    { symbol: "xNVDA", name: "Tokenized NVIDIA Corp." },
    { symbol: "xMSFT", name: "Tokenized Microsoft Corp." },
    { symbol: "xGOOGL", name: "Tokenized Alphabet Inc." },
    { symbol: "xAMZN", name: "Tokenized Amazon.com Inc." },
    { symbol: "xMETA", name: "Tokenized Meta Platforms" },
    { symbol: "xRELI", name: "Tokenized Reliance Industries" },
    { symbol: "xTCS", name: "Tokenized Tata Consultancy" },
    { symbol: "xJPM", name: "Tokenized JPMorgan Chase" },
    { symbol: "xKO", name: "Tokenized Coca-Cola Co." },
    { symbol: "xINFY", name: "Tokenized Infosys Ltd." },
  ];

  const deployedStocks: { [symbol: string]: string } = {};

  const TokenizedStockFactory = await ethers.getContractFactory("TokenizedStock");

  for (const s of stockSymbols) {
    // Deploy stock token owned by the platform
    const stockToken = await TokenizedStockFactory.deploy(s.name, s.symbol, platformAddr);
    await stockToken.waitForDeployment();
    const tokenAddr = await stockToken.getAddress();
    
    // Register in platform
    await platform.registerStock(s.symbol, tokenAddr);
    
    deployedStocks[s.symbol] = tokenAddr;
    console.log(`📈 Registered ${s.symbol} at ${tokenAddr}`);
  }

  const hre = require("hardhat");
  const activeRpcUrl = hre.network.config.url || "http://127.0.0.1:8545";

  // Save addresses to JSON file
  const addresses = {
    MockUSDC: usdcAddr,
    StockwavePlatform: platformAddr,
    OracleSigner: oracleAddress,
    stocks: deployedStocks,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    rpcUrl: activeRpcUrl,
  };

  const outputPath = path.join(__dirname, "../../deployed-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));
  console.log("💾 Addresses saved to:", outputPath);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
