import { ethers } from "ethers";
import fs from "fs";
import path from "path";

export type DeployedConfig = {
  network: string;
  chainId: number;
  rpcUrl: string;
  explorer: string;
  deployer: string;
  agent: string;
  attestationSigner: string;
  labels: Record<string, string>;
  tokens: { USDC: string; EURC: string; mockMode: boolean };
  contracts: {
    StableFXAdapter: string;
    GroupOrder: string;
    WarehouseReceipt: string;
  };
  supplier: { id: string; name: string; address: string; privateKey?: string };
  buyers: { name: string; address: string; privateKey: string }[];
  arcOfficial: Record<string, string>;
  deployedAt: string;
};

export const AED_PER_USD = 3.6725;

export const BUYERS_DEMO = [
  { id: "restaurant-a", name: "Restaurant A", quantity: 100, maxAED: 15000, quality: "Extra Virgin" },
  { id: "restaurant-b", name: "Restaurant B", quantity: 180, maxAED: 27000, quality: "Extra Virgin" },
  { id: "hotel-c", name: "Hotel C", quantity: 250, maxAED: 38000, quality: "Extra Virgin" },
  { id: "grocery-d", name: "Grocery D", quantity: 130, maxAED: 20000, quality: "Extra Virgin" },
  { id: "catering-e", name: "Catering Company E", quantity: 200, maxAED: 30000, quality: "Extra Virgin" },
];

export const SUPPLIERS_SANDBOX = [
  {
    id: "oliva-sur",
    name: "Oliva Sur Cooperativa",
    origin: "Jaén, Spain",
    priceEUR: 37.5,
    moq: 1000,
    deliveryDays: 30,
    acceptsEURC: true,
    acceptsUSDC: false,
    verified: true,
  },
  {
    id: "andalucia-gold",
    name: "Andalucía Gold Oils",
    origin: "Córdoba, Spain",
    priceEUR: 39.2,
    moq: 800,
    deliveryDays: 21,
    acceptsEURC: true,
    acceptsUSDC: false,
    verified: true,
  },
  {
    id: "sierra-verde",
    name: "Sierra Verde Export",
    origin: "Granada, Spain",
    priceEUR: 36.8,
    moq: 1200,
    deliveryDays: 40,
    acceptsEURC: false,
    acceptsUSDC: true,
    verified: true,
  },
];

export function loadDeployed(): DeployedConfig {
  const candidates = [
    path.join(process.cwd(), "deployed-addresses.json"),
    path.join(process.cwd(), "..", "deployed-addresses.json"),
    path.join(__dirname, "..", "..", "deployed-addresses.json"),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf8"));
    }
  }
  throw new Error("deployed-addresses.json not found — run blockchain deploy first");
}

export function aedToUsdc(aed: number): bigint {
  const usdc = aed / AED_PER_USD;
  return ethers.parseUnits(usdc.toFixed(6), 6);
}

export function usdcToAed(usdc: number): number {
  return usdc * AED_PER_USD;
}

export const GROUP_ORDER_ABI = [
  "function createOrder(string,string,string,uint256,uint256,uint256) returns (uint256)",
  "function joinOrderFor(uint256,address,uint256,uint256,uint256,uint256,string)",
  "function fundMandateFor(uint256,address,uint256)",
  "function submitSupplierOffer(uint256,address,string,uint256,uint256,uint256,uint256,bytes32)",
  "function policyCheck(uint256) view returns (bool,string)",
  "function acceptSupplierOffer(uint256)",
  "function executeSettlement(uint256)",
  "function releaseUnusedFundsFor(uint256,address)",
  "function setSupplierWhitelist(address,bool)",
  "function getOrder(uint256) view returns (tuple(uint256 id,string productName,string origin,string packaging,uint256 targetQuantity,uint256 originalMOQ,uint256 totalDemand,uint256 totalFundedUSDC,uint8 status,uint256 createdAt,uint256 expiry,address acceptedSupplier,uint256 settledUSDC,uint256 settledEURC,bytes32 settlementTxMemo))",
  "function getMandates(uint256) view returns (tuple(address buyer,uint256 quantity,uint256 maxUSDC,uint256 deliveryDeadline,uint256 maxSlippageBps,uint256 fundedUSDC,bool funded,bool active,bool refunded,string businessName)[])",
  "function getOffer(uint256) view returns (tuple(address supplier,string supplierId,uint256 quantity,uint256 unitPriceEURC,uint256 totalEURC,uint256 totalUSDCBudget,uint256 expiry,bytes32 termsHash,bool accepted,bool exists))",
  "function nextOrderId() view returns (uint256)",
  "event OrderCreated(uint256 indexed orderId, string productName, uint256 originalMOQ)",
  "event SettlementExecuted(uint256 indexed orderId, address supplier, uint256 usdcSpent, uint256 eurcPaid, uint256 feeUSDC)",
];

export const RECEIPT_ABI = [
  "function createBatch(string,string,string,string,string,address,uint256,uint256) returns (uint256)",
  "function registerAllocation(uint256,address,uint256)",
  "function verifyBatch(uint256,bytes32)",
  "function mintAllAllocations(uint256)",
  "function setKYB(address,bool)",
  "function requestRedemption(uint256,uint256)",
  "function confirmRedemption(uint256,address,uint256)",
  "function balanceOf(address,uint256) view returns (uint256)",
  "function getBatch(uint256) view returns (tuple(uint256 id,string batchCode,string productName,string origin,string packaging,string supplier,address custodian,uint256 totalQuantity,uint256 mintedQuantity,uint256 redeemedQuantity,uint8 status,bytes32 attestationHash,uint256 groupOrderId,bool paused))",
  "function getAllocations(uint256) view returns (tuple(address buyer,uint256 quantity,uint256 redeemed,bool minted)[])",
  "function nextBatchId() view returns (uint256)",
];

export const ERC20_ABI = [
  "function approve(address,uint256) returns (bool)",
  "function balanceOf(address) view returns (uint256)",
  "function faucet(address,uint256)",
  "function mint(address,uint256)",
  "function transfer(address,uint256) returns (bool)",
  "function decimals() view returns (uint8)",
];

export const FX_ABI = [
  "function quote(uint256) view returns (uint256,uint256)",
  "function rateE6() view returns (uint256)",
  "function feeBps() view returns (uint256)",
];
