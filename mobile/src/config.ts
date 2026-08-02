import fujiAddresses from "./addresses-fuji.json";
import monadStub from "./addresses-monad.json";

/** Monad Testnet — primary target network for this mobile app */
export const MONAD_TESTNET = {
  chainId: 10143,
  name: "Monad Testnet",
  rpcUrl: "https://testnet-rpc.monad.xyz",
  explorer: "https://testnet.monadvision.com",
  currency: "MON",
};

/** Live Fuji deployment used until Monad contracts are deployed */
export const FUJI = {
  chainId: 43113,
  name: "Avalanche Fuji",
  rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc",
  explorer: "https://testnet.snowtrace.io",
  currency: "AVAX",
};

export const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  "https://nexora-backend-production-a457.up.railway.app";

type Addresses = {
  MockUSDC?: string;
  StockwavePlatform?: string;
  OracleSigner?: string;
  stocks?: Record<string, string>;
  chainId?: string;
  rpcUrl?: string;
};

const monadAddresses = monadStub as Addresses;
export const USE_MONAD = Boolean(monadAddresses.StockwavePlatform);

export const NETWORK = USE_MONAD
  ? MONAD_TESTNET
  : {
      ...FUJI,
      name: "Monad-ready · settling on Fuji until Monad deploy",
    };

export const ADDRESSES = (
  USE_MONAD ? monadAddresses : fujiAddresses
) as Required<Addresses>;

export const PLATFORM_ABI = [
  "function buyStock(string symbol, uint256 qty, uint256 price, uint256 deadline, bytes signature) external",
  "function sellStock(string symbol, uint256 qty, uint256 price, uint256 deadline, bytes signature) external",
];

export const USDC_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address, address) view returns (uint256)",
  "function approve(address, uint256) returns (bool)",
  "function faucet() external",
  "function decimals() view returns (uint8)",
];
