import { ethers } from "ethers";
import dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

dotenv.config();

// Load deployed addresses
let addresses: any = {};
const loadAddresses = () => {
  try {
    const filePath = path.join(__dirname, "../../deployed-addresses.json");
    if (fs.existsSync(filePath)) {
      addresses = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch (e) {
    console.warn("⚠️ Warning: deployed-addresses.json could not be parsed.");
  }
};

loadAddresses();

// Fallback to Hardhat Account #0 private key
const PRIVATE_KEY = process.env.ORACLE_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const wallet = new ethers.Wallet(PRIVATE_KEY);

export const getOracleAddress = () => wallet.address;

/**
 * Sign a trade quote using EIP-712
 */
export const signTradeQuote = async (
  user: string,
  symbol: string,
  qty: string, // quantity in 18 decimal string representation
  price: number, // price in 6 decimals
  deadline: number,
  nonce: number
) => {
  loadAddresses(); // Ensure latest addresses are loaded
  
  const contractAddress = addresses.StockwavePlatform || ethers.ZeroAddress;
  const chainId = parseInt(addresses.chainId || "31337");

  const domain = {
    name: "StockwavePlatform",
    version: "1",
    chainId: chainId,
    verifyingContract: contractAddress,
  };

  const types = {
    TradeQuote: [
      { name: "user", type: "address" },
      { name: "symbol", type: "string" },
      { name: "qty", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "nonce", type: "uint256" },
    ],
  };

  const value = {
    user: user,
    symbol: symbol,
    qty: ethers.getBigInt(qty),
    price: price,
    deadline: deadline,
    nonce: nonce,
  };

  const signature = await wallet.signTypedData(domain, types, value);
  return signature;
};
