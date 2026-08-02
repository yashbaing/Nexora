import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ethers } from "ethers";
import { api, setAuthToken } from "./api";
import { ADDRESSES, NETWORK, USDC_ABI } from "./config";

type WalletCtx = {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number;
  networkName: string;
  signer: ethers.Wallet | null;
  provider: ethers.JsonRpcProvider | null;
  usdcBalance: number;
  connectDemo: () => Promise<void>;
  loginWithEmail: (email: string, name?: string) => Promise<void>;
  disconnect: () => Promise<void>;
  refreshUsdc: () => Promise<void>;
  claimFaucet: () => Promise<void>;
};

const Ctx = createContext<WalletCtx | null>(null);

async function persist(key: string, value: string | null) {
  if (value == null) {
    await AsyncStorage.removeItem(key);
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      /* ignore */
    }
    return;
  }
  await AsyncStorage.setItem(key, value);
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    /* SecureStore unavailable on some envs */
  }
}

async function read(key: string) {
  try {
    const s = await SecureStore.getItemAsync(key);
    if (s) return s;
  } catch {
    /* ignore */
  }
  return AsyncStorage.getItem(key);
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [signer, setSigner] = useState<ethers.Wallet | null>(null);
  const [provider, setProvider] = useState<ethers.JsonRpcProvider | null>(null);
  const [usdcBalance, setUsdcBalance] = useState(0);

  const chainId = NETWORK.chainId;
  const networkName = NETWORK.name;

  const refreshUsdc = useCallback(async () => {
    if (!signer || !ADDRESSES.MockUSDC) return;
    try {
      const usdc = new ethers.Contract(ADDRESSES.MockUSDC, USDC_ABI, signer);
      const bal = await usdc.balanceOf(signer.address);
      setUsdcBalance(Number(ethers.formatUnits(bal, 6)));
    } catch {
      setUsdcBalance(0);
    }
  }, [signer]);

  const finishLogin = useCallback(
    async (token: string, privateKey: string, addr: string) => {
      const rpc = new ethers.JsonRpcProvider(NETWORK.rpcUrl);
      const wallet = new ethers.Wallet(privateKey, rpc);
      setProvider(rpc);
      setSigner(wallet);
      setAddress(addr);
      setAuthToken(token);
      setIsConnected(true);
      await persist("nexora_jwt", token);
      await persist("nexora_address", addr);
      await persist("nexora_private_key", privateKey);
    },
    []
  );

  const connectDemo = useCallback(async () => {
    try {
      setIsConnecting(true);
      // Same demo key used by web app for Fuji/L1 testing
      const privateKey =
        "0x81e6a5e00cd5123be27dabf88639c9bd41a8d617c14d1858b26ad162362a54ad";
      const rpc = new ethers.JsonRpcProvider(NETWORK.rpcUrl);
      const wallet = new ethers.Wallet(privateKey, rpc);
      const timestamp = Date.now();
      const message = `Sign in to Nexora Trading Platform\n\nWallet: ${wallet.address}\nTimestamp: ${timestamp}`;
      const signature = await wallet.signMessage(message);
      const { data } = await api.post("/api/auth/web3-login", {
        address: wallet.address,
        signature,
        message,
        name: "MobileTrader",
      });
      await finishLogin(data.token, privateKey, wallet.address);
    } catch (e: any) {
      Alert.alert("Login failed", e?.message || "Could not connect demo wallet");
    } finally {
      setIsConnecting(false);
    }
  }, [finishLogin]);

  const loginWithEmail = useCallback(
    async (email: string, name = "Mobile User") => {
      try {
        setIsConnecting(true);
        const { data } = await api.post("/api/auth/google-login", { email, name });
        await finishLogin(data.token, data.privateKey, data.user.id);
      } catch (e: any) {
        Alert.alert("Login failed", e?.message || "Email login failed");
      } finally {
        setIsConnecting(false);
      }
    },
    [finishLogin]
  );

  const disconnect = useCallback(async () => {
    setIsConnected(false);
    setAddress(null);
    setSigner(null);
    setProvider(null);
    setUsdcBalance(0);
    setAuthToken(null);
    await persist("nexora_jwt", null);
    await persist("nexora_address", null);
    await persist("nexora_private_key", null);
  }, []);

  const claimFaucet = useCallback(async () => {
    if (!signer || !ADDRESSES.MockUSDC) return;
    try {
      const usdc = new ethers.Contract(ADDRESSES.MockUSDC, USDC_ABI, signer);
      const tx = await usdc.faucet();
      await tx.wait();
      await refreshUsdc();
      Alert.alert("Faucet", "Test USDC added to your wallet.");
    } catch (e: any) {
      Alert.alert("Faucet failed", e?.reason || e?.message || "Try again");
    }
  }, [signer, refreshUsdc]);

  useEffect(() => {
    (async () => {
      const token = await read("nexora_jwt");
      const pk = await read("nexora_private_key");
      const addr = await read("nexora_address");
      if (token && pk && addr) {
        try {
          await finishLogin(token, pk, addr);
        } catch {
          await disconnect();
        }
      }
    })();
  }, [finishLogin, disconnect]);

  useEffect(() => {
    if (isConnected) refreshUsdc();
  }, [isConnected, refreshUsdc]);

  const value = useMemo(
    () => ({
      address,
      isConnected,
      isConnecting,
      chainId,
      networkName,
      signer,
      provider,
      usdcBalance,
      connectDemo,
      loginWithEmail,
      disconnect,
      refreshUsdc,
      claimFaucet,
    }),
    [
      address,
      isConnected,
      isConnecting,
      chainId,
      networkName,
      signer,
      provider,
      usdcBalance,
      connectDemo,
      loginWithEmail,
      disconnect,
      refreshUsdc,
      claimFaucet,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWallet() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
