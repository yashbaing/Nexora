import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.26",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 77777,
    },
    localhost: {
      url: "http://localhost:8545",
      chainId: 77777,
    },
    fuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      chainId: 43113,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    customL1: {
      url: process.env.L1_RPC_URL || "http://127.0.0.1:9650/ext/bc/C/rpc",
      chainId: process.env.L1_CHAIN_ID ? parseInt(process.env.L1_CHAIN_ID) : 12345,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    nexoraL1: {
      url: process.env.NEXORA_L1_RPC_URL || "http://127.0.0.1:9654/ext/bc/2M4yVQxvusf3M87KM5uDYVoGm7cum8XjjdVKPmoubmgAxgRerv/rpc",
      chainId: 66666,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
