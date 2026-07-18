"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import axios from "axios";

export interface EIP6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  };
  provider: any;
}

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  signer: ethers.Signer | null;
  provider: ethers.AbstractProvider | null;
  chainId: number | null;
  jwtToken: string | null;
  connectWallet: (selectedProvider?: EIP6963ProviderDetail) => Promise<void>;
  connectDevAccount: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
  isCorrectNetwork: boolean;
  isDevAccount: boolean;
  loginWithGoogle: (email: string, name: string) => Promise<void>;
  loginWithGoogleApi: (credential: string) => Promise<void>;
  injectedProviders: EIP6963ProviderDetail[];
  targetChainId: number;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const BACKEND_URL = "http://127.0.0.1:5001";

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [provider, setProvider] = useState<ethers.AbstractProvider | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [isDevAccount, setIsDevAccount] = useState<boolean>(false);
  const [targetChainId, setTargetChainId] = useState<number>(43113); // Default to Fuji Testnet
  const [targetRpcUrl, setTargetRpcUrl] = useState<string>("https://api.avax-test.network/ext/bc/C/rpc");
  const [injectedProviders, setInjectedProviders] = useState<EIP6963ProviderDetail[]>([]);

  // Listen for EIP-6963 wallet announcements
  useEffect(() => {
    const handleAnnounce = (event: any) => {
      const detail: EIP6963ProviderDetail = event.detail;
      setInjectedProviders((prev) => {
        if (prev.find((p) => p.info.uuid === detail.info.uuid)) return prev;
        return [...prev, detail];
      });
    };

    window.addEventListener("eip6963:announceProvider", handleAnnounce as EventListener);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => {
      window.removeEventListener("eip6963:announceProvider", handleAnnounce as EventListener);
    };
  }, []);

  useEffect(() => {
    const fetchTargetChain = async () => {
      try {
        const resp = await fetch(`${BACKEND_URL}/deployed-addresses.json`);
        if (resp.ok) {
          const data = await resp.json();
          if (data.chainId) {
            setTargetChainId(parseInt(data.chainId));
            console.log("🎯 Dynamic Target Chain ID set to:", data.chainId);
          }
          if (data.rpcUrl) {
            setTargetRpcUrl(data.rpcUrl);
            console.log("🔌 Dynamic RPC URL set to:", data.rpcUrl);
          }
        }
      } catch (e) {
        console.warn("Could not fetch target chain ID or RPC URL from backend, default to Fuji:", e);
      }
    };
    fetchTargetChain();
  }, []);

  const isCorrectNetwork = chainId === targetChainId;

  const disconnectWallet = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setSigner(null);
    setProvider(null);
    setChainId(null);
    setJwtToken(null);
    setIsDevAccount(false);
    localStorage.removeItem("stockwave_jwt");
    localStorage.removeItem("stockwave_address");
    localStorage.removeItem("stockwave_is_dev");
    localStorage.removeItem("stockwave_private_key");
    delete axios.defaults.headers.common["Authorization"];
  }, []);

  const switchNetwork = useCallback(async () => {
    let rawProvider = (window as any).ethereum;
    if (provider && (provider as any).provider) {
      rawProvider = (provider as any).provider;
    }
    if (!rawProvider) return;
    
    const hexChainId = "0x" + targetChainId.toString(16);
    
    try {
      await rawProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
    } catch (switchError: any) {
      console.warn("Switch network failed, attempting to add network as fallback...", switchError);
      try {
        const chainParams = targetChainId === 43113 ? {
          chainId: "0xa869",
          chainName: "Avalanche Fuji Testnet",
          nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
          rpcUrls: ["https://api.avax-test.network/ext/bc/C/rpc"],
          blockExplorerUrls: ["https://testnet.snowtrace.io/"]
        } : targetChainId === 31337 ? {
          chainId: "0x7a69",
          chainName: "Hardhat Localhost",
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          rpcUrls: ["http://127.0.0.1:8545"],
        } : targetChainId === 77777 ? {
          chainId: "0x12fcd",
          chainName: "Avalanche Custom L1",
          nativeCurrency: { name: "STW", symbol: "STW", decimals: 18 },
          rpcUrls: ["http://127.0.0.1:8545"],
        } : {
          chainId: hexChainId,
          chainName: "Avalanche Custom L1",
          nativeCurrency: { name: "AVAX", symbol: "AVAX", decimals: 18 },
          rpcUrls: [targetRpcUrl],
        };

        await rawProvider.request({
          method: "wallet_addEthereumChain",
          params: [chainParams],
        });
      } catch (addError) {
        console.error("❌ Failed to add network:", addError);
      }
    }
  }, [targetChainId, targetRpcUrl, provider]);

  const connectWallet = useCallback(async (selectedProvider?: EIP6963ProviderDetail) => {
    let walletProvider = (window as any).ethereum;
    if (selectedProvider) {
      walletProvider = selectedProvider.provider;
    }

    if (!walletProvider) {
      alert("Please install a Web3 Wallet (like MetaMask or Core Wallet) to continue!");
      return;
    }

    try {
      setIsConnecting(true);
      
      const accounts = await walletProvider.request({ method: "eth_requestAccounts" });
      if (accounts.length === 0) throw new Error("No accounts found");
      
      const rawAddress = accounts[0];
      const browserProvider = new ethers.BrowserProvider(walletProvider);
      const tempSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();
      const currentChainId = Number(network.chainId);

      setProvider(browserProvider);
      setSigner(tempSigner);
      setChainId(currentChainId);
      setIsDevAccount(false);

      if (currentChainId !== targetChainId) {
        await switchNetwork();
        const updatedNetwork = await browserProvider.getNetwork();
        setChainId(Number(updatedNetwork.chainId));
      }

      const cachedToken = localStorage.getItem("stockwave_jwt");
      const cachedAddress = localStorage.getItem("stockwave_address");
      const cachedIsDev = localStorage.getItem("stockwave_is_dev") === "true";
      
      if (cachedToken && cachedAddress?.toLowerCase() === rawAddress.toLowerCase() && !cachedIsDev) {
        setAddress(rawAddress);
        setJwtToken(cachedToken);
        axios.defaults.headers.common["Authorization"] = `Bearer ${cachedToken}`;
        setIsConnected(true);
        setIsConnecting(false);
        return;
      }

      const timestamp = Date.now();
      const message = `Sign in to Stockwave Trading Platform\n\nWallet: ${rawAddress}\nTimestamp: ${timestamp}`;
      const signature = await tempSigner.signMessage(message);

      const loginResp = await axios.post(`${BACKEND_URL}/api/auth/web3-login`, {
        address: rawAddress,
        signature,
        message,
      });

      const { token } = loginResp.data;
      setAddress(rawAddress);
      setJwtToken(token);
      localStorage.setItem("stockwave_jwt", token);
      localStorage.setItem("stockwave_address", rawAddress);
      localStorage.setItem("stockwave_is_dev", "false");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsConnected(true);
    } catch (err) {
      console.error("❌ Wallet connection failed:", err);
      disconnectWallet();
    } finally {
      setIsConnecting(false);
    }
  }, [disconnectWallet, switchNetwork, targetChainId]);

  const connectDevAccount = useCallback(async () => {
    try {
      setIsConnecting(true);
      
      const isFuji = targetChainId === 43113;
      const devPrivateKey = isFuji
        ? "0x81e6a5e00cd5123be27dabf88639c9bd41a8d617c14d1858b26ad162362a54ad" // Fuji deployer wallet
        : "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"; // Localhost Hardhat Account #1

      const devProvider = new ethers.JsonRpcProvider(targetRpcUrl);
      const devSigner = new ethers.Wallet(devPrivateKey, devProvider);
      
      const rawAddress = devSigner.address;
      const timestamp = Date.now();
      const message = `Sign in to Stockwave Trading Platform\n\nWallet: ${rawAddress}\nTimestamp: ${timestamp}`;
      const signature = await devSigner.signMessage(message);

      const loginResp = await axios.post(`${BACKEND_URL}/api/auth/web3-login`, {
        address: rawAddress,
        signature,
        message,
        name: "DevTrader",
      });

      const { token } = loginResp.data;
      setProvider(devProvider);
      setSigner(devSigner);
      setChainId(targetChainId);
      setAddress(rawAddress);
      setJwtToken(token);
      setIsDevAccount(true);
      
      localStorage.setItem("stockwave_jwt", token);
      localStorage.setItem("stockwave_address", rawAddress);
      localStorage.setItem("stockwave_is_dev", "true");
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsConnected(true);
    } catch (err) {
      console.error("❌ Dev Account connection failed:", err);
      alert("Dev Account connection failed. Verify the network RPC is accessible!");
    } finally {
      setIsConnecting(false);
    }
  }, [targetChainId, targetRpcUrl]);

  const loginWithGoogle = useCallback(async (email: string, name: string) => {
    try {
      setIsConnecting(true);
      
      const loginResp = await axios.post(`${BACKEND_URL}/api/auth/google-login`, {
        email,
        name
      });
      
      const { token, privateKey, user } = loginResp.data;
      
      const devProvider = new ethers.JsonRpcProvider(targetRpcUrl);
      const devSigner = new ethers.Wallet(privateKey, devProvider);
      
      setProvider(devProvider);
      setSigner(devSigner);
      setChainId(targetChainId);
      setAddress(user.id);
      setJwtToken(token);
      setIsDevAccount(true);
      
      localStorage.setItem("stockwave_jwt", token);
      localStorage.setItem("stockwave_address", user.id);
      localStorage.setItem("stockwave_is_dev", "true");
      localStorage.setItem("stockwave_private_key", privateKey);
      
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsConnected(true);
    } catch (err) {
      console.error("❌ Google login failed:", err);
      alert("Google login failed. Please try again!");
    } finally {
      setIsConnecting(false);
    }
  }, [targetChainId, targetRpcUrl]);

  const loginWithGoogleApi = useCallback(async (credential: string) => {
    try {
      setIsConnecting(true);
      
      const loginResp = await axios.post(`${BACKEND_URL}/api/auth/google-api-login`, {
        credential
      });
      
      const { token, privateKey, user } = loginResp.data;
      
      const devProvider = new ethers.JsonRpcProvider(targetRpcUrl);
      const devSigner = new ethers.Wallet(privateKey, devProvider);
      
      setProvider(devProvider);
      setSigner(devSigner);
      setChainId(targetChainId);
      setAddress(user.id);
      setJwtToken(token);
      setIsDevAccount(true);
      
      localStorage.setItem("stockwave_jwt", token);
      localStorage.setItem("stockwave_address", user.id);
      localStorage.setItem("stockwave_is_dev", "true");
      localStorage.setItem("stockwave_private_key", privateKey);
      
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsConnected(true);
    } catch (err) {
      console.error("❌ Google API login failed:", err);
      alert("Google API Authentication failed. Please try again!");
    } finally {
      setIsConnecting(false);
    }
  }, [targetChainId, targetRpcUrl]);

  useEffect(() => {
    if (isDevAccount) return; // Don't track window.ethereum events for dev accounts
    
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (address && accounts[0].toLowerCase() !== address.toLowerCase()) {
        disconnectWallet();
        connectWallet();
      }
    };

    const handleChainChanged = (hexChainId: string) => {
      setChainId(parseInt(hexChainId, 16));
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
    ethereum.on("chainChanged", handleChainChanged);

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
      ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [address, connectWallet, disconnectWallet, isDevAccount]);

  useEffect(() => {
    const checkAuthorized = async () => {
      const cachedToken = localStorage.getItem("stockwave_jwt");
      const cachedAddress = localStorage.getItem("stockwave_address");
      const cachedIsDev = localStorage.getItem("stockwave_is_dev") === "true";

      if (cachedToken && cachedAddress) {
        try {
          if (cachedIsDev) {
            const cachedPrivateKey = localStorage.getItem("stockwave_private_key");
            
            const isFuji = targetChainId === 43113;
            const privateKey = cachedPrivateKey || (
              isFuji
                ? "0x81e6a5e00cd5123be27dabf88639c9bd41a8d617c14d1858b26ad162362a54ad"
                : "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
            );
            
            const devProvider = new ethers.JsonRpcProvider(targetRpcUrl);
            const devSigner = new ethers.Wallet(privateKey, devProvider);
            
            setProvider(devProvider);
            setSigner(devSigner);
            setChainId(targetChainId);
            setAddress(cachedAddress);
            setJwtToken(cachedToken);
            setIsDevAccount(true);
            axios.defaults.headers.common["Authorization"] = `Bearer ${cachedToken}`;
            setIsConnected(true);
          } else {
            // Pick MetaMask or default injected provider to auto-login
            const ethereum = (window as any).ethereum;
            if (!ethereum) return;
            const accounts = await ethereum.request({ method: "eth_accounts" });
            if (accounts.length > 0 && accounts[0].toLowerCase() === cachedAddress.toLowerCase()) {
              const browserProvider = new ethers.BrowserProvider(ethereum);
              const tempSigner = await browserProvider.getSigner();
              const network = await browserProvider.getNetwork();
              
              setProvider(browserProvider);
              setSigner(tempSigner);
              setChainId(Number(network.chainId));
              setAddress(accounts[0]);
              setJwtToken(cachedToken);
              axios.defaults.headers.common["Authorization"] = `Bearer ${cachedToken}`;
              setIsConnected(true);
            } else {
              disconnectWallet();
            }
          }
        } catch (e) {
          disconnectWallet();
        }
      }
    };

    checkAuthorized();
  }, [disconnectWallet, targetChainId, targetRpcUrl]);

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected,
        isConnecting,
        signer,
        provider,
        chainId,
        jwtToken,
        connectWallet,
        connectDevAccount,
        disconnectWallet,
        switchNetwork,
        isCorrectNetwork,
        isDevAccount,
        loginWithGoogle,
        loginWithGoogleApi,
        injectedProviders,
        targetChainId,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
