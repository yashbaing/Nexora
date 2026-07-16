"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { ethers } from "ethers";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  Briefcase,
  Wallet as WalletIcon,
  User,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  ChevronRight,
  ChevronLeft,
  Smartphone,
  Copy,
  Check,
  Star,
  Eye,
  EyeOff,
  Globe,
  Shield,
  LogOut,
  Sparkles,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";

const BACKEND_URL = "http://127.0.0.1:5001";
axios.defaults.baseURL = BACKEND_URL;

/* ════════════════════════════════════════════════════════════════════
   PALETTE — clean white minimal (same as mockup)
   ════════════════════════════════════════════════════════════════════ */
const C = {
  bg: "#ffffff",
  bg2: "#fafaf9",
  card: "#f5f5f4",
  cardHi: "#e7e5e4",
  border: "#e7e5e4",
  borderHi: "#d6d3d1",
  ink: "#0c0a09",
  inkDim: "#57534e",
  inkMute: "#a8a29e",
  accent: "#0c0a09",
  accentSoft: "rgba(12, 10, 9, 0.06)",
  accentInk: "#ffffff",
  gain: "#16a34a",
  gainSoft: "rgba(22, 163, 74, 0.08)",
  loss: "#dc2626",
  lossSoft: "rgba(220, 38, 38, 0.08)",
  ember: "#ea580c",
  shellBg: "#e7e5e4",
};

const sans = { fontFamily: "var(--font-geist-sans), -apple-system, sans-serif" };
const serif = { fontFamily: "Georgia, serif", letterSpacing: "-0.025em" };
const mono = { fontFamily: "var(--font-geist-mono), monospace" };

// Currency formatter
const fmtUSD = (n: number) =>
  "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtPrice = (price: number, currency: string) => {
  if (currency === "INR") {
    return "₹" + (price * 84.5).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  }
  return fmtUSD(price);
};

// UI Components
const Pill = ({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    type="button"
    style={{
      padding: "8px 16px",
      borderRadius: 999,
      border: `1px solid ${active ? C.ink : C.border}`,
      background: active ? C.ink : "transparent",
      color: active ? C.bg : C.inkDim,
      fontSize: 12,
      fontWeight: 500,
      letterSpacing: "0.02em",
      transition: "all .15s",
      whiteSpace: "nowrap",
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);

const Delta = ({ value, big = false }: { value: number; big?: boolean }) => {
  const up = value >= 0;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 3,
        color: up ? C.gain : C.loss,
        fontSize: big ? 14 : 11,
        fontWeight: 600,
        ...mono,
      }}
    >
      {up ? "▲" : "▼"} {up ? "+" : ""}
      {value.toFixed(2)}%
    </span>
  );
};

const Row = ({ label, val, valColor, bold }: { label: string; val: string; valColor?: string; bold?: boolean }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "12px 0",
      borderBottom: `1px solid ${C.border}`,
      fontSize: bold ? 14 : 12,
      color: bold ? C.ink : C.inkDim,
      fontWeight: bold ? 600 : 400,
    }}
  >
    <span>{label}</span>
    <span style={{ ...mono, color: valColor || C.ink, fontWeight: 500 }}>{val}</span>
  </div>
);

// Stock metadata interface
interface Stock {
  symbol: string;
  name: string;
  sector: string;
  currency: string;
  region: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  volume: string;
  dayHigh: number;
  dayLow: number;
}

export default function Page() {
  const { address, isConnected, isConnecting, connectWallet, connectDevAccount, disconnectWallet, provider, signer, isCorrectNetwork, switchNetwork, isDevAccount, loginWithGoogle, loginWithGoogleApi } = useWallet();

  // Navigation
  const [tab, setTab] = useState<string>("home"); // home, markets, portfolio, wallet
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeSide, setTradeSide] = useState<"buy" | "sell" | null>(null);
  const [tradeQty, setTradeQty] = useState<string>("");
  const [isExecutingTrade, setIsExecutingTrade] = useState<boolean>(false);

  // Google Auth states
  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);
  const [googleEmail, setGoogleEmail] = useState<string>("");
  const [googleName, setGoogleName] = useState<string>("");
  const [isSubmittingGoogle, setIsSubmittingGoogle] = useState<boolean>(false);

  // Initialize official Google Identity Services button
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const initGoogleApiButton = () => {
      const google = (window as any).google;
      if (google && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (res: any) => {
            if (res.credential) {
              try {
                await loginWithGoogleApi(res.credential);
              } catch (err) {
                console.error("Google Sign-In callback error:", err);
              }
            }
          }
        });

        const container = document.getElementById("google-official-btn");
        if (container) {
          google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            width: 298,
            text: "signin_with",
            shape: "pill"
          });
        }
      } else {
        setTimeout(initGoogleApiButton, 200);
      }
    };

    initGoogleApiButton();
  }, [loginWithGoogleApi, isConnected]);

  // Faucet state
  const [faucetAmount, setFaucetAmount] = useState<string>("1000");
  const [isFaucetLoading, setIsFaucetLoading] = useState<boolean>(false);

  // Watchlist & Stock list
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [portfolio, setPortfolio] = useState<{ holdings: any[]; cash: number; web3: any }>({ holdings: [], cash: 0, web3: null });
  const [transactions, setTransactions] = useState<any[]>([]);

  // Candle Chart State
  const [chartInterval, setChartInterval] = useState<string>("1h");
  const [candles, setCandles] = useState<any[]>([]);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All");

  const [balanceVisible, setBalanceVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Deployed Contract Addresses loaded dynamically
  const [deployedAddresses, setDeployedAddresses] = useState<any>({});

  // 1. Fetch static addresses config
  const fetchAddresses = async () => {
    try {
      const resp = await axios.get("/api/stocks"); // proxy call is fine, or we can fetch direct addresses
      // We will load dynamically from our backend
      const addrsResp = await fetch(`${BACKEND_URL}/deployed-addresses.json`);
      if (addrsResp.ok) {
        const data = await addrsResp.json();
        setDeployedAddresses(data);
      }
    } catch (e) {
      console.warn("Could not load addresses file.");
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  // 2. HTTP fetches for stocks list, watchlist, portfolio, and transactions
  const fetchStocksList = async () => {
    try {
      const resp = await axios.get("/api/stocks");
      setStocks(resp.data);
    } catch (e) {
      console.error("Error fetching stocks list:", e);
    }
  };

  const fetchWatchlist = async () => {
    if (!isConnected) return;
    try {
      const resp = await axios.get("/api/user/watchlist");
      setWatchlist(resp.data);
    } catch (e) {
      console.error("Error fetching watchlist:", e);
    }
  };

  const fetchPortfolio = async () => {
    if (!isConnected) return;
    try {
      const resp = await axios.get("/api/portfolio");
      setPortfolio(resp.data);
    } catch (e) {
      console.error("Error fetching portfolio:", e);
    }
  };

  const fetchTransactions = async () => {
    if (!isConnected) return;
    try {
      const resp = await axios.get("/api/trades/history");
      setTransactions(resp.data);
    } catch (e) {
      console.error("Error fetching transactions:", e);
    }
  };

  const refreshUserData = useCallback(async () => {
    if (!isConnected) return;
    await Promise.all([fetchWatchlist(), fetchPortfolio(), fetchTransactions()]);
  }, [isConnected]);

  // Initial load
  useEffect(() => {
    fetchStocksList();
  }, []);

  useEffect(() => {
    if (isConnected) {
      refreshUserData();
    }
  }, [isConnected, refreshUserData]);

  // 3. WebSocket Realtime Prices
  useEffect(() => {
    const socket = io(BACKEND_URL);

    socket.on("connect", () => {
      console.log("⚡ Connected to real-time price socket");
    });

    socket.on("prices_update", (updates: { [symbol: string]: any }) => {
      setStocks((prevStocks) =>
        prevStocks.map((stock) => {
          const update = updates[stock.symbol];
          if (update) {
            return {
              ...stock,
              price: update.price,
              change: update.change,
              changePercent: update.changePercent,
              dayHigh: update.dayHigh,
              dayLow: update.dayLow,
            };
          }
          return stock;
        })
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Sync selected stock updates
  const activeStock = useMemo(() => {
    if (!selectedStock) return null;
    return stocks.find((s) => s.symbol === selectedStock.symbol) || selectedStock;
  }, [selectedStock, stocks]);

  // 4. Fetch OHLC Candles for selected stock
  const fetchCandles = useCallback(async () => {
    if (!selectedStock) return;
    try {
      setIsChartLoading(true);
      const resp = await axios.get(`/api/stocks/${selectedStock.symbol}/candles`, {
        params: { interval: chartInterval, limit: 120 },
      });
      setCandles(resp.data);
    } catch (e) {
      console.error("Error fetching candles chart:", e);
    } finally {
      setIsChartLoading(false);
    }
  }, [selectedStock, chartInterval]);

  useEffect(() => {
    if (selectedStock) {
      fetchCandles();
    }
  }, [selectedStock, chartInterval, fetchCandles]);

  // Toggle watchlist item
  const handleToggleWatchlist = async (symbol: string) => {
    if (!isConnected) return connectWallet();
    try {
      const resp = await axios.post("/api/user/watchlist/toggle", { symbol });
      if (resp.data.status === "added") {
        setWatchlist((w) => [...w, symbol]);
      } else {
        setWatchlist((w) => w.filter((x) => x !== symbol));
      }
    } catch (e) {
      console.error("Error toggling watchlist:", e);
    }
  };

  // 5. On-chain Faucet Claim
  const handleFaucetClaim = async () => {
    if (!signer || !deployedAddresses.MockUSDC) return;
    try {
      setIsFaucetLoading(true);
      
      const usdcAbi = ["function faucet(uint256) external"];
      const usdcContract = new ethers.Contract(deployedAddresses.MockUSDC, usdcAbi, signer);

      const parsedAmount = ethers.parseUnits(faucetAmount, 6);
      
      console.log(`Sending Faucet TX for ${faucetAmount} USDC...`);
      const tx = await usdcContract.faucet(parsedAmount);
      await tx.wait();

      alert(`✅ Successfully claimed ${faucetAmount} USDC!`);
      refreshUserData();
    } catch (err: any) {
      console.error("Faucet error:", err);
      alert(`Faucet Error: ${err.reason || err.message}`);
    } finally {
      setIsFaucetLoading(false);
    }
  };

  // 6. On-chain Trade Execution
  const executeTrade = async () => {
    const stock = activeStock;
    if (!signer || !stock || !tradeQty || !deployedAddresses.StockwavePlatform) return;
    
    try {
      setIsExecutingTrade(true);
      
      // Calculate costs
      const qtyFloat = parseFloat(tradeQty);
      const usdcCost = qtyFloat * stock.price;
      
      const platformAddress = deployedAddresses.StockwavePlatform;
      const usdcAddress = deployedAddresses.MockUSDC;

      // Check allowance & approve USDC if buying
      const usdcAbi = [
        "function balanceOf(address) view returns (uint256)",
        "function allowance(address, address) view returns (uint256)",
        "function approve(address, uint256) returns (bool)"
      ];
      const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, signer);

      const userBalance = await usdcContract.balanceOf(address);
      const costInUnits = ethers.parseUnits(usdcCost.toFixed(6), 6);

      if (tradeSide === "buy") {
        if (userBalance < costInUnits) {
          alert(`❌ Insufficient USDC balance! You need $${usdcCost.toFixed(2)} USDC.`);
          setIsExecutingTrade(false);
          return;
        }

        const allowance = await usdcContract.allowance(address, platformAddress);
        if (allowance < costInUnits) {
          console.log("Approving USDC spend...");
          const approveTx = await usdcContract.approve(platformAddress, ethers.MaxUint256);
          await approveTx.wait();
          console.log("USDC Spend Approved!");
        }
      }

      // Request Signed Quote from Backend Signer
      console.log("Requesting trade signature from backend oracle...");
      const quoteResp = await axios.post("/api/trades/quote", {
        symbol: stock.symbol,
        qty: tradeQty,
        side: tradeSide,
      });

      const { contractQty, contractPrice, deadline, signature } = quoteResp.data;

      // Instantiate Platform Contract
      const platformAbi = [
        "function buyStock(string symbol, uint256 qty, uint256 price, uint256 deadline, bytes signature) external",
        "function sellStock(string symbol, uint256 qty, uint256 price, uint256 deadline, bytes signature) external"
      ];
      const platformContract = new ethers.Contract(platformAddress, platformAbi, signer);

      console.log(`Executing ${tradeSide} transaction on Avalanche C-Chain...`);
      let tx;
      if (tradeSide === "buy") {
        tx = await platformContract.buyStock(
          stock.symbol,
          contractQty,
          contractPrice,
          deadline,
          signature
        );
      } else {
        tx = await platformContract.sellStock(
          stock.symbol,
          contractQty,
          contractPrice,
          deadline,
          signature
        );
      }

      console.log("Waiting for confirmation on-chain...");
      await tx.wait();
      
      console.log("Transaction confirmed on-chain! Synchronizing backend...");
      
      // Trigger sync in postgres
      await axios.post("/api/trades/sync", { txHash: tx.hash });
      console.log("DB Synchronized!");

      alert(`🎉 Trade executed successfully!`);
      setTradeQty("");
      setTradeSide(null);
      refreshUserData();
    } catch (err: any) {
      console.error("Trade transaction failed:", err);
      alert(`Trade failed: ${err.reason || err.message}`);
    } finally {
      setIsExecutingTrade(false);
    }
  };

  // Copy wallet address helper
  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Search filter lists
  const filteredStocks = useMemo(() => {
    return stocks.filter(
      (s) =>
        (sectorFilter === "All" || s.sector === sectorFilter) &&
        (s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [stocks, searchQuery, sectorFilter]);

  // Enriched portfolio metrics in INR and USD
  const enrichedPortfolio = useMemo(() => {
    const holdings = portfolio.holdings.map((h) => {
      const s = stocks.find((x) => x.symbol === h.symbol);
      if (!s) return { ...h, currentPrice: h.avgPrice, valueUSD: h.qty * h.avgPrice, pnlPercent: 0 };
      const currentPrice = s.price;
      const valueUSD = h.qty * currentPrice;
      const costUSD = h.qty * h.avgPrice;
      const pnlPercent = h.avgPrice > 0 ? ((currentPrice - h.avgPrice) / h.avgPrice) * 100 : 0;
      return {
        ...h,
        currentPrice,
        valueUSD,
        pnlPercent,
      };
    });

    const totalHoldingsUSD = holdings.reduce((a, h) => a + h.valueUSD, 0);
    const totalUSD = totalHoldingsUSD + portfolio.cash;

    // mock P&L
    const totalCost = holdings.reduce((a, h) => a + h.qty * h.avgPrice, 0);
    const totalPnlUSD = totalHoldingsUSD - totalCost;
    const totalPnlPercent = totalCost > 0 ? (totalPnlUSD / totalCost) * 100 : 0;

    return {
      holdings,
      totalUSD,
      totalHoldingsUSD,
      totalPnlUSD,
      totalPnlPercent,
    };
  }, [portfolio, stocks]);

  // Layout Styles (Identical to premium mobile mock shell)
  const shellStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#e7e5e4",
    padding: "20px 10px",
    ...sans,
  };

  const phoneStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: 420,
    height: 840,
    background: C.bg,
    borderRadius: 40,
    boxShadow: "0 24px 64px rgba(12, 10, 9, 0.15), 0 2px 8px rgba(12, 10, 9, 0.05)",
    border: `8px solid ${C.ink}`,
    position: "relative",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  };

  const TabBar = () => (
    <div
      style={{
        height: 76,
        borderTop: `1px solid ${C.border}`,
        display: "flex",
        background: C.bg,
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
      }}
    >
      {[
        { id: "home", label: "Home", icon: <User size={20} /> },
        { id: "markets", label: "Markets", icon: <TrendingUp size={20} /> },
        { id: "portfolio", label: "Portfolio", icon: <Briefcase size={20} /> },
        { id: "wallet", label: "Wallet", icon: <WalletIcon size={20} /> },
      ].map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => {
            setTab(t.id);
            setSelectedStock(null);
          }}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            background: "none",
            border: "none",
            color: tab === t.id && !selectedStock ? C.ink : C.inkMute,
            cursor: "pointer",
            fontSize: 10,
            fontWeight: tab === t.id ? 600 : 500,
          }}
        >
          {t.icon}
          {t.label}
        </button>
      ))}
    </div>
  );

  // Wait until mounted on client to prevent hydration mismatches
  if (!hasMounted) {
    return (
      <div style={shellStyle}>
        <div style={phoneStyle}>
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 30px" }}>
            <div style={{ color: C.ink, fontSize: 13, fontWeight: 500 }}>Loading Stockwave...</div>
          </div>
        </div>
      </div>
    );
  }

  // Authentication Required Screen
  if (!isConnected) {
    return (
      <div style={shellStyle}>
        <div style={phoneStyle}>
          <div style={{ height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "40px 30px" }}>
            <div style={{ marginTop: 60 }}>
              <div style={{ ...serif, fontSize: 44, color: C.ink, lineHeight: 1.1, fontWeight: 400, letterSpacing: "-0.04em" }}>
                Stockwave.
              </div>
              <div style={{ fontSize: 13, color: C.inkDim, marginTop: 12, lineHeight: 1.5 }}>
                A premium, Avalanche-native Web3 equities platform settled securely in USDC with institutional liquidity powered by Hyperliquid.
              </div>
            </div>

            <div style={{ marginBottom: 40 }}>
              <button
                type="button"
                onClick={connectWallet}
                disabled={isConnecting}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: C.ink,
                  color: C.bg,
                  borderRadius: 16,
                  fontSize: 14,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  cursor: "pointer",
                  border: "none",
                  boxShadow: "0 4px 12px rgba(12, 10, 9, 0.15)",
                }}
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="animate-spin" size={16} /> Connecting Wallet...
                  </>
                ) : (
                  <>Connect Core / MetaMask</>
                )}
              </button>
              
              <button
                type="button"
                onClick={connectDevAccount}
                disabled={isConnecting}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "transparent",
                  color: C.ink,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  fontSize: 14,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  cursor: "pointer",
                  marginTop: 12,
                  boxShadow: "0 2px 4px rgba(12, 10, 9, 0.02)",
                }}
              >
                Browse with Dev Account (No Extension)
              </button>
              
              {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
                <div style={{ marginTop: 12, display: "flex", justifyContent: "center", width: "100%" }}>
                  <div id="google-official-btn" />
                </div>
              )}
              
              <button
                type="button"
                onClick={() => setShowGoogleModal(true)}
                disabled={isConnecting}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "transparent",
                  color: C.ink,
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  fontSize: 14,
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  cursor: "pointer",
                  marginTop: 12,
                  boxShadow: "0 2px 4px rgba(12, 10, 9, 0.02)",
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="#EA4335" d="M12 5.04c1.67 0 3.17.58 4.35 1.71l3.25-3.25C17.63 1.55 15.02.96 12 .96 7.28.96 3.25 3.68 1.25 7.63l3.88 3.01C6.07 7.74 8.79 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.52 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.46c-.28 1.46-1.1 2.69-2.33 3.52l3.61 2.8c2.12-1.95 3.78-4.83 3.78-8.45z" />
                  <path fill="#FBBC05" d="M5.13 14.36c-.24-.73-.38-1.52-.38-2.36s.14-1.63.38-2.36L1.25 6.63C.45 8.24 0 10.06 0 12s.45 3.76 1.25 5.37l3.88-3.01z" />
                  <path fill="#34A853" d="M12 23.04c3.24 0 5.97-1.07 7.96-2.91l-3.61-2.8c-1.2.8-2.73 1.27-4.35 1.27-3.21 0-5.93-2.7-6.87-5.6L1.25 16c2 3.95 6.03 6.67 10.75 6.67z" />
                </svg>
                Sign in with Google (Embedded Wallet)
              </button>
              
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 16, fontSize: 11, color: C.inkMute }}>
                <Shield size={12} /> Secure non-custodial login
              </div>
            </div>
          </div>
        </div>

        {/* Google Authentication Dialog Overlay */}
        {showGoogleModal && (
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(12, 10, 9, 0.4)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
            padding: 20,
          }}>
            <div style={{
              background: C.bg,
              borderRadius: 24,
              width: "100%",
              maxWidth: 320,
              padding: "28px 24px",
              border: `1px solid ${C.border}`,
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
            }}>
              <div style={{ marginBottom: 16 }}>
                <svg viewBox="0 0 24 24" width="28" height="28">
                  <path fill="#EA4335" d="M12 5.04c1.67 0 3.17.58 4.35 1.71l3.25-3.25C17.63 1.55 15.02.96 12 .96 7.28.96 3.25 3.68 1.25 7.63l3.88 3.01C6.07 7.74 8.79 5.04 12 5.04z" />
                  <path fill="#4285F4" d="M23.52 12.27c0-.82-.07-1.61-.21-2.38H12v4.51h6.46c-.28 1.46-1.1 2.69-2.33 3.52l3.61 2.8c2.12-1.95 3.78-4.83 3.78-8.45z" />
                  <path fill="#FBBC05" d="M5.13 14.36c-.24-.73-.38-1.52-.38-2.36s.14-1.63.38-2.36L1.25 6.63C.45 8.24 0 10.06 0 12s.45 3.76 1.25 5.37l3.88-3.01z" />
                  <path fill="#34A853" d="M12 23.04c3.24 0 5.97-1.07 7.96-2.91l-3.61-2.8c-1.2.8-2.73 1.27-4.35 1.27-3.21 0-5.93-2.7-6.87-5.6L1.25 16c2 3.95 6.03 6.67 10.75 6.67z" />
                </svg>
              </div>

              <h4 style={{ fontSize: 18, color: C.ink, fontWeight: 600, margin: "0 0 4px 0" }}>Sign in with Google</h4>
              <p style={{ fontSize: 12, color: C.inkMute, margin: "0 0 20px 0" }}>to continue to Nexora Stockwave</p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!googleEmail) return;
                try {
                  setIsSubmittingGoogle(true);
                  await loginWithGoogle(googleEmail, googleName || "");
                  setShowGoogleModal(false);
                } catch (err) {
                  console.error(err);
                } finally {
                  setIsSubmittingGoogle(false);
                }
              }} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                <input 
                  type="email"
                  placeholder="Email address"
                  required
                  value={googleEmail}
                  onChange={(e) => setGoogleEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1px solid ${C.border}`,
                    background: "transparent",
                    color: C.ink,
                    fontSize: 13,
                    outline: "none",
                  }}
                />

                <input 
                  type="text"
                  placeholder="Name (Optional)"
                  value={googleName}
                  onChange={(e) => setGoogleName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    borderRadius: 12,
                    border: `1px solid ${C.border}`,
                    background: "transparent",
                    color: C.ink,
                    fontSize: 13,
                    outline: "none",
                  }}
                />

                <button
                  type="submit"
                  disabled={isSubmittingGoogle}
                  style={{
                    background: C.ink,
                    color: C.bg,
                    border: "none",
                    borderRadius: 12,
                    padding: "12px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {isSubmittingGoogle ? "Authenticating..." : "Continue"}
                </button>

                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  style={{
                    background: "transparent",
                    color: C.inkMute,
                    border: "none",
                    fontSize: 12,
                    cursor: "pointer",
                    marginTop: 4,
                  }}
                >
                  Cancel
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Network Check Screen
  if (!isCorrectNetwork && !isDevAccount) {
    return (
      <div style={shellStyle}>
        <div style={phoneStyle}>
          <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "40px 30px", textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: C.lossSoft, color: C.loss, display: "grid", placeItems: "center", marginBottom: 24 }}>
              <Shield size={32} />
            </div>
            <h3 style={{ ...serif, fontSize: 26, color: C.ink, fontWeight: 400, marginBottom: 12 }}>Wrong Network</h3>
            <p style={{ fontSize: 13, color: C.inkDim, lineHeight: 1.5, marginBottom: 32 }}>
              Stockwave settles trades securely on Avalanche Localhost. Please switch your wallet network to proceed.
            </p>
            <button
              type="button"
              onClick={switchNetwork}
              style={{
                width: "100%",
                padding: "16px",
                background: C.ink,
                color: C.bg,
                borderRadius: 16,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                border: "none",
              }}
            >
              Switch to Hardhat Network
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Core Render
  const active = activeStock;

  return (
    <div style={shellStyle}>
      <div style={phoneStyle}>
        <div style={{ height: "100%", overflowY: "auto", paddingBottom: 76 }}>
          {active ? (
            /* ════════════════════════════════════════════════════════════════════
               STOCK DETAIL VIEW
               ════════════════════════════════════════════════════════════════════ */
            <>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "24px 22px 18px", position: "sticky", top: 0, zIndex: 10,
                background: `linear-gradient(to bottom, ${C.bg} 88%, ${C.bg}f0 100%)`,
                backdropFilter: "blur(8px)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => { setSelectedStock(null); setTradeSide(null); }} type="button" style={{
                    width: 36, height: 36, borderRadius: 12,
                    background: C.card, border: `1px solid ${C.border}`,
                    display: "grid", placeItems: "center", color: C.ink,
                    cursor: "pointer",
                  }}><ChevronLeft size={18} /></button>
                  <div>
                    <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 600 }}>{active.name}</div>
                    <div style={{ ...serif, fontSize: 26, color: C.ink, lineHeight: 1, fontWeight: 400 }}>{active.symbol}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleWatchlist(active.symbol)}
                  style={{
                    width: 36, height: 36, borderRadius: 12,
                    background: watchlist.includes(active.symbol) ? C.accentSoft : C.card,
                    border: `1px solid ${watchlist.includes(active.symbol) ? C.ink : C.border}`,
                    display: "grid", placeItems: "center",
                    color: watchlist.includes(active.symbol) ? C.ink : C.inkMute,
                    cursor: "pointer",
                  }}
                >
                  <Star size={15} fill={watchlist.includes(active.symbol) ? C.ink : "none"} />
                </button>
              </div>

              <div style={{ padding: "0 22px 24px" }}>
                {/* Real-time price update indicator */}
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ ...serif, fontSize: 52, color: C.ink, lineHeight: 1, letterSpacing: "-0.04em" }}>
                    {fmtPrice(active.price, active.currency)}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <Delta value={active.changePercent} big />
                    <div style={{ ...mono, fontSize: 9, color: C.inkMute, marginTop: 2, letterSpacing: "0.04em" }}>LIVE HYPERLIQUID Feed</div>
                  </div>
                </div>

                {/* TradingView-Style Candlestick Recharts Chart */}
                <div style={{ height: 220, marginLeft: -22, marginRight: -22, marginTop: 18, position: "relative" }}>
                  {isChartLoading ? (
                    <div style={{ height: "100%", display: "grid", placeItems: "center", color: C.inkMute, fontSize: 11 }}>
                      Loading candles...
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={candles} margin={{ top: 10, bottom: 5, left: 10, right: 10 }}>
                        <XAxis dataKey="time" hide />
                        <YAxis domain={["auto", "auto"]} hide />
                        <Tooltip
                          content={({ active: isTooltipActive, payload }) => {
                            if (isTooltipActive && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div style={{ background: C.ink, color: C.bg, padding: "8px 12px", borderRadius: 8, fontSize: 10, ...mono }}>
                                  <div>O: {fmtPrice(data.open, active.currency)}</div>
                                  <div>H: {fmtPrice(data.high, active.currency)}</div>
                                  <div>L: {fmtPrice(data.low, active.currency)}</div>
                                  <div>C: {fmtPrice(data.close, active.currency)}</div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        {/* Candlestick Wicks (High to Low line) */}
                        <Bar dataKey="high" fill="#b91c1c" radius={0} maxBarSize={1} />
                        {/* Candlestick Body */}
                        <Bar
                          dataKey="close"
                          maxBarSize={8}
                          shape={(props: any) => {
                            const { x, y, width, height, payload } = props;
                            const isUp = payload.close >= payload.open;
                            const fill = isUp ? C.gain : C.loss;
                            // Calculate body heights
                            const top = Math.min(props.y, props.y + props.height) || y;
                            return (
                              <rect
                                x={x}
                                y={top}
                                width={width}
                                height={Math.max(2, Math.abs(height))}
                                fill={fill}
                              />
                            );
                          }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Range Selectors */}
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, padding: 4, background: C.card, borderRadius: 12, border: `1px solid ${C.border}` }}>
                  {["1m", "5m", "15m", "1h", "1d"].map((r) => (
                    <button key={r} type="button" onClick={() => setChartInterval(r)} style={{
                      flex: 1, padding: "8px 0", fontSize: 11, fontWeight: 600,
                      color: chartInterval === r ? C.bg : C.inkDim,
                      background: chartInterval === r ? C.ink : "transparent",
                      borderRadius: 8, ...mono, transition: "all .2s",
                      border: "none", cursor: "pointer",
                    }}>{r.toUpperCase()}</button>
                  ))}
                </div>

                {/* Position detail */}
                {enrichedPortfolio.holdings.find(h => h.symbol === active.symbol) && (
                  <div style={{
                    marginTop: 26, padding: 18, borderRadius: 16,
                    background: C.card, border: `1px solid ${C.border}`,
                  }}>
                    <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 14, fontWeight: 600 }}>Your position</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, rowGap: 16 }}>
                      <div>
                        <div style={{ fontSize: 10, color: C.inkMute, textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>Holdings</div>
                        <div style={{ ...serif, fontSize: 24, color: C.ink, lineHeight: 1 }}>
                          {enrichedPortfolio.holdings.find(h => h.symbol === active.symbol).qty}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: C.inkMute, textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>Value</div>
                        <div style={{ ...serif, fontSize: 24, color: C.ink, lineHeight: 1 }}>
                          {fmtPrice(enrichedPortfolio.holdings.find(h => h.symbol === active.symbol).valueUSD, active.currency)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: C.inkMute, textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>Avg cost</div>
                        <div style={{ ...mono, fontSize: 13, color: C.ink, fontWeight: 500 }}>
                          {fmtPrice(enrichedPortfolio.holdings.find(h => h.symbol === active.symbol).avgPrice, active.currency)}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 10, color: C.inkMute, textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>P&L</div>
                        <div style={{ marginTop: 2 }}>
                          <Delta value={enrichedPortfolio.holdings.find(h => h.symbol === active.symbol).pnlPercent} big />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* About metrics */}
                <div style={{ marginTop: 26 }}>
                  <h3 style={{ ...serif, fontSize: 20, color: C.ink, margin: "0 0 14px", fontWeight: 400 }}>About Token</h3>
                  <div>
                    {[
                      ["Sector", active.sector],
                      ["Market cap", active.marketCap || "N/A"],
                      ["24h volume", active.volume || "N/A"],
                      ["Day high", fmtPrice(active.dayHigh || active.price, active.currency)],
                      ["Day low", fmtPrice(active.dayLow || active.price, active.currency)],
                      ["Token standard", "Solidity ERC-20"],
                      ["Avalanche Contract Address", deployedAddresses.stocks?.[active.symbol]?.slice(0, 10) + "..."],
                    ].map(([k, v], i, arr) => (
                      <div key={k} style={{
                        display: "flex", justifyContent: "space-between", padding: "14px 0",
                        borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
                      }}>
                        <span style={{ fontSize: 13, color: C.inkMute }}>{k}</span>
                        <span style={{ fontSize: 13, color: C.ink, ...mono, fontWeight: 500 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Execution Bar */}
              <div style={{
                position: "absolute", bottom: 0, left: 0, right: 0,
                padding: "16px 22px", background: C.bg,
                borderTop: `1px solid ${C.border}`, display: "flex", flexDirection: "column", gap: 12,
                zIndex: 30,
              }}>
                {tradeSide ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", justifySelf: "center", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ fontSize: 12, color: C.inkDim, fontWeight: 600 }}>
                        {tradeSide.toUpperCase()} shares
                      </div>
                      <button
                        onClick={() => { setTradeSide(null); setTradeQty(""); }}
                        style={{ background: "none", border: "none", color: C.inkMute, cursor: "pointer", fontSize: 12 }}
                      >
                        Cancel
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <input
                        type="number"
                        placeholder="Shares Qty"
                        value={tradeQty}
                        onChange={(e) => setTradeQty(e.target.value)}
                        style={{
                          flex: 1, padding: "12px", border: `1px solid ${C.border}`, borderRadius: 12,
                          background: C.bg2, color: C.ink, outline: "none", fontSize: 14, ...mono,
                        }}
                      />
                      <button
                        type="button"
                        onClick={executeTrade}
                        disabled={isExecutingTrade || !tradeQty}
                        style={{
                          padding: "12px 24px", borderRadius: 12,
                          background: tradeSide === "buy" ? C.gain : C.loss,
                          color: C.bg, border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer",
                        }}
                      >
                        {isExecutingTrade ? "Settle..." : `Confirm ${tradeSide === "buy" ? "Buy" : "Sell"}`}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", gap: 10 }}>
                    <button type="button" onClick={() => setTradeSide("sell")} style={{
                      flex: 1, padding: "15px", borderRadius: 14,
                      background: "transparent", color: C.loss,
                      border: `1px solid ${C.loss}40`,
                      fontSize: 14, fontWeight: 600, cursor: "pointer",
                    }}>Sell</button>
                    <button type="button" onClick={() => setTradeSide("buy")} style={{
                      flex: 1.5, padding: "15px", borderRadius: 14,
                      background: C.gain, color: C.bg, border: "none",
                      fontSize: 14, fontWeight: 600, cursor: "pointer",
                    }}>Buy {active.symbol}</button>
                  </div>
                )}
              </div>
            </>
          ) : tab === "home" ? (
            /* ════════════════════════════════════════════════════════════════════
               HOME VIEW
               ════════════════════════════════════════════════════════════════════ */
            <>
              <div style={{
                display: "flex", alignItems: "flex-start", justifyContent: "space-between",
                padding: "24px 22px 18px", position: "sticky", top: 0, zIndex: 10,
                background: `linear-gradient(to bottom, ${C.bg} 88%, ${C.bg}f0 100%)`,
                backdropFilter: "blur(8px)",
              }}>
                <div>
                  <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 4, fontWeight: 600 }}>Active Wallet</div>
                  <div style={{ ...serif, fontSize: 24, color: C.ink, lineHeight: 1, fontWeight: 400, display: "flex", alignItems: "center", gap: 6 }}>
                    {address?.slice(0, 6) + "..." + address?.slice(-4)}
                    <button onClick={copyAddress} style={{ background: "none", border: "none", color: C.inkMute, cursor: "pointer" }}>
                      {copied ? <Check size={14} color={C.gain} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                <button
                  onClick={disconnectWallet}
                  style={{
                    width: 36, height: 36, borderRadius: 12,
                    background: C.card, border: `1px solid ${C.border}`,
                    display: "grid", placeItems: "center", color: C.ink,
                    cursor: "pointer",
                  }}
                >
                  <LogOut size={16} />
                </button>
              </div>

              {/* Ticker Tape */}
              <div style={{ borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}`, overflow: "hidden", position: "relative", background: C.bg2 }}>
                <div className="animate-ticker" style={{ display: "flex", gap: 28, padding: "10px 0", whiteSpace: "nowrap", width: "max-content" }}>
                  {[...stocks.slice(0, 6), ...stocks.slice(0, 6), ...stocks.slice(0, 6)].map((s, i) => (
                    <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 8, ...mono, fontSize: 11 }}>
                      <span style={{ color: C.inkDim }}>{s.symbol}</span>
                      <span style={{ color: C.ink }}>{fmtUSD(s.price)}</span>
                      <span style={{ color: s.changePercent >= 0 ? C.gain : C.loss }}>
                        {s.changePercent >= 0 ? "+" : ""}
                        {s.changePercent.toFixed(2)}%
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ padding: "24px 22px 24px" }}>
                {/* Net worth card */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 11, color: C.inkMute, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600 }}>Total Value</div>
                    <button type="button" onClick={() => setBalanceVisible(!balanceVisible)} style={{ color: C.inkMute, fontSize: 11, display: "flex", alignItems: "center", gap: 4, cursor: "pointer", background: "none", border: "none" }}>
                      {balanceVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                      {balanceVisible ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div style={{ ...serif, fontSize: 58, color: C.ink, lineHeight: 0.95, marginTop: 12, marginBottom: 4, letterSpacing: "-0.04em" }}>
                    {balanceVisible ? fmtUSD(enrichedPortfolio.totalUSD) : "••••••"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Delta value={enrichedPortfolio.totalPnlPercent} big />
                    <span style={{ fontSize: 11, color: C.inkMute, letterSpacing: "0.04em" }}>
                      <span style={{ color: enrichedPortfolio.totalPnlUSD >= 0 ? C.gain : C.loss, ...mono }}>
                        {enrichedPortfolio.totalPnlUSD >= 0 ? "+" : ""}
                        {fmtUSD(enrichedPortfolio.totalPnlUSD)}
                      </span>{" "}
                      all-time P&L
                    </span>
                  </div>
                </div>

                {/* Dashboard wiggles */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 32 }}>
                  <button type="button" onClick={() => setTab("wallet")} style={{
                    padding: "16px", background: C.ink, color: C.bg,
                    borderRadius: 14, fontSize: 13, fontWeight: 600,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    cursor: "pointer", border: "none",
                  }}>
                    <Plus size={14} /> Deposit USDC
                  </button>
                  <button type="button" onClick={() => setTab("markets")} style={{
                    padding: "16px", background: C.bg, color: C.ink,
                    border: `1px solid ${C.border}`, borderRadius: 14,
                    fontSize: 13, fontWeight: 500, cursor: "pointer",
                  }}>Markets</button>
                </div>

                {/* Movers section */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                  <h3 style={{ ...serif, fontSize: 22, color: C.ink, margin: 0, fontWeight: 400 }}>Movers</h3>
                  <button type="button" onClick={() => setTab("markets")} style={{
                    fontSize: 11, color: C.ink, letterSpacing: "0.08em", textTransform: "uppercase",
                    display: "flex", alignItems: "center", gap: 2, fontWeight: 600,
                    cursor: "pointer", background: "none", border: "none",
                  }}>All markets <ChevronRight size={11} /></button>
                </div>
                <div style={{ display: "flex", gap: 10, overflowX: "auto", margin: "0 -22px", padding: "4px 22px 4px", scrollbarWidth: "none" }}>
                  {stocks.slice(0, 4).map((s) => (
                    <button key={s.symbol} type="button" onClick={() => setSelectedStock(s)} style={{
                      minWidth: 150, background: C.bg, border: `1px solid ${C.border}`,
                      borderRadius: 18, padding: 16, textAlign: "left", cursor: "pointer",
                    }}>
                      <div style={{ ...mono, fontSize: 11, color: C.inkDim, marginBottom: 2, fontWeight: 500 }}>{s.symbol}</div>
                      <div style={{ ...serif, fontSize: 24, color: C.ink, lineHeight: 1, marginBottom: 4 }}>
                        {fmtUSD(s.price)}
                      </div>
                      <Delta value={s.changePercent} />
                    </button>
                  ))}
                </div>

                {/* Recent transaction history listing */}
                <div style={{ marginTop: 32 }}>
                  <h3 style={{ ...serif, fontSize: 22, color: C.ink, margin: "0 0 14px", fontWeight: 400 }}>On-Chain History</h3>
                  {transactions.slice(0, 4).map((tx, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", padding: "14px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 12,
                        background: tx.type === "deposit" ? C.gainSoft : tx.type === "buy" ? C.accentSoft : C.lossSoft,
                        color: tx.type === "deposit" ? C.gain : tx.type === "buy" ? C.ink : C.loss,
                        display: "grid", placeItems: "center", marginRight: 14,
                      }}>
                        {tx.type === "deposit" ? <Plus size={16} /> : tx.type === "buy" ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: C.ink, fontWeight: 500 }}>
                          {tx.type === "deposit" ? "USDC Deposit" : tx.type === "buy" ? `Bought ${tx.symbol}` : `Sold ${tx.symbol}`}
                        </div>
                        <div style={{ fontSize: 10, color: C.inkMute, marginTop: 2 }}>{tx.when}</div>
                      </div>
                      <div style={{ ...mono, fontSize: 13, color: C.ink, fontWeight: 500 }}>
                        {tx.type === "deposit" ? fmtUSD(tx.amount) : `${tx.qty} shares`}
                      </div>
                    </div>
                  ))}
                  {transactions.length === 0 && (
                    <div style={{ textAlign: "center", padding: "30px", color: C.inkMute, fontSize: 12 }}>No transactions yet.</div>
                  )}
                </div>
              </div>
            </>
          ) : tab === "markets" ? (
            /* ════════════════════════════════════════════════════════════════════
               MARKETS VIEW
               ════════════════════════════════════════════════════════════════════ */
            <>
              <div style={{ padding: "24px 22px 18px" }}>
                <div style={{ ...serif, fontSize: 30, color: C.ink, lineHeight: 1, fontWeight: 400 }}>Markets</div>
                <div style={{ fontSize: 11, color: C.inkMute, marginTop: 4 }}>Real-time quotes powered by Hyperliquid</div>
              </div>

              <div style={{ padding: "0 22px 24px" }}>
                {/* Search bar */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: C.card, border: `1px solid ${C.border}`, borderRadius: 14,
                  padding: "14px 16px", marginBottom: 16,
                }}>
                  <Search size={16} color={C.inkMute} />
                  <input
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by symbol or name"
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.ink, fontSize: 14 }}
                  />
                </div>

                {/* Filter pills */}
                <div style={{ display: "flex", gap: 8, overflowX: "auto", margin: "0 -22px", padding: "0 22px 18px", scrollbarWidth: "none" }}>
                  {["All", "Tech", "Finance", "Auto", "Energy", "Consumer"].map((f) => (
                    <Pill key={f} active={sectorFilter === f} onClick={() => setSectorFilter(f)}>
                      {f}
                    </Pill>
                  ))}
                </div>

                {/* Table Header */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 90px",
                  gap: 12, padding: "0 4px 8px",
                  fontSize: 9, color: C.inkMute, letterSpacing: "0.18em", textTransform: "uppercase",
                  borderBottom: `1px solid ${C.border}`, marginBottom: 4, fontWeight: 600,
                }}>
                  <span>Equity Token</span>
                  <span style={{ textAlign: "right" }}>Price & 24h</span>
                </div>

                {/* Stock Listing */}
                <div>
                  {filteredStocks.map((s, i) => (
                    <button
                      key={s.symbol}
                      type="button"
                      onClick={() => setSelectedStock(s)}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 90px",
                        alignItems: "center",
                        width: "100%",
                        padding: "14px 4px",
                        background: "transparent",
                        border: "none",
                        borderBottom: i < filteredStocks.length - 1 ? `1px solid ${C.border}` : "none",
                        textAlign: "left",
                        cursor: "pointer",
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 14, color: C.ink, fontWeight: 600 }}>{s.symbol}</span>
                          <span style={{ fontSize: 10, color: C.inkMute }}>{s.name}</span>
                        </div>
                        <div style={{ ...mono, fontSize: 11, color: C.inkMute, marginTop: 2 }}>{s.sector}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ ...mono, fontSize: 13, color: C.ink, fontWeight: 500 }}>
                          {fmtPrice(s.price, s.currency)}
                        </div>
                        <div style={{ marginTop: 2 }}>
                          <Delta value={s.changePercent} />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : tab === "portfolio" ? (
            /* ════════════════════════════════════════════════════════════════════
               PORTFOLIO VIEW
               ════════════════════════════════════════════════════════════════════ */
            <>
              <div style={{ padding: "24px 22px 18px" }}>
                <div style={{ ...serif, fontSize: 30, color: C.ink, lineHeight: 1, fontWeight: 400 }}>Portfolio</div>
                <div style={{ fontSize: 11, color: C.inkMute, marginTop: 4 }}>Your tokenized positions on Avalanche</div>
              </div>

              <div style={{ padding: "0 22px 24px" }}>
                <div style={{ marginBottom: 26 }}>
                  <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>Total Portfolio Value</div>
                  <div style={{ ...serif, fontSize: 44, color: C.ink, lineHeight: 1, letterSpacing: "-0.04em" }}>
                    {fmtUSD(enrichedPortfolio.totalHoldingsUSD)}
                  </div>
                </div>

                {/* Allocation Pie Chart */}
                {enrichedPortfolio.holdings.length > 0 && (
                  <div style={{
                    padding: 18, background: C.card, border: `1px solid ${C.border}`,
                    borderRadius: 16, display: "flex", alignItems: "center", gap: 18, marginBottom: 26,
                  }}>
                    <div style={{ width: 100, height: 100, flexShrink: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={enrichedPortfolio.holdings} dataKey="valueUSD" innerRadius={30} outerRadius={46} paddingAngle={2} stroke="none" isAnimationActive={false}>
                            {enrichedPortfolio.holdings.map((_, i) => (
                              <Cell key={i} fill={["#0c0a09", "#16a34a", "#ea580c", "#7c3aed"][i % 4]} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>Allocation</div>
                      {enrichedPortfolio.holdings.map((h, i) => (
                        <div key={h.symbol} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, marginBottom: 4 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 2, background: ["#0c0a09", "#16a34a", "#ea580c", "#7c3aed"][i % 4] }} />
                          <span style={{ ...mono, color: C.inkDim, flex: 1 }}>{h.symbol}</span>
                          <span style={{ ...mono, color: C.ink, fontWeight: 500 }}>
                            {((h.valueUSD / (enrichedPortfolio.totalHoldingsUSD || 1)) * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <h3 style={{ ...serif, fontSize: 20, color: C.ink, margin: "0 0 14px", fontWeight: 400 }}>Holdings</h3>
                <div>
                  {enrichedPortfolio.holdings.map((h) => {
                    const matchedStock = stocks.find(s => s.symbol === h.symbol);
                    return (
                      <button
                        key={h.symbol}
                        type="button"
                        onClick={() => matchedStock && setSelectedStock(matchedStock)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                          padding: "14px 4px",
                          background: "transparent",
                          border: "none",
                          borderBottom: `1px solid ${C.border}`,
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, color: C.ink, fontWeight: 600 }}>{h.symbol}</div>
                          <div style={{ fontSize: 11, color: C.inkMute, marginTop: 2 }}>
                            {h.qty} shares · Avg {fmtUSD(h.avgPrice)}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ ...mono, fontSize: 13, color: C.ink, fontWeight: 500 }}>
                            {fmtUSD(h.valueUSD)}
                          </div>
                          <div style={{ marginTop: 2 }}>
                            <Delta value={h.pnlPercent} />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {enrichedPortfolio.holdings.length === 0 && (
                    <div style={{ textAlign: "center", padding: "40px", color: C.inkMute, fontSize: 12 }}>
                      No stock holdings. Buy shares under Markets!
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* ════════════════════════════════════════════════════════════════════
               WALLET VIEW & FAUCET
               ════════════════════════════════════════════════════════════════════ */
            <>
              <div style={{ padding: "24px 22px 18px" }}>
                <div style={{ ...serif, fontSize: 30, color: C.ink, lineHeight: 1, fontWeight: 400 }}>Wallet</div>
                <div style={{ fontSize: 11, color: C.inkMute, marginTop: 4 }}>Fund account & check USDC balances</div>
              </div>

              <div style={{ padding: "0 22px 24px" }}>
                {/* On-chain balance */}
                <div style={{
                  padding: 20, borderRadius: 16, background: C.card,
                  border: `1px solid ${C.border}`, marginBottom: 26,
                }}>
                  <div style={{ fontSize: 10, color: C.inkMute, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 6, fontWeight: 600 }}>USDC Settlement Balance</div>
                  <div style={{ ...serif, fontSize: 36, color: C.ink, lineHeight: 1 }}>
                    {fmtUSD(portfolio.cash)}
                  </div>
                  <div style={{ fontSize: 11, color: C.inkMute, marginTop: 8, ...mono }}>Avalanche C-Chain</div>
                </div>

                {/* Local Faucet tool */}
                <div style={{
                  padding: 20, borderRadius: 16, border: `1px dashed ${C.border}`,
                  background: C.bg2, marginBottom: 26,
                }}>
                  <h4 style={{ ...serif, fontSize: 16, color: C.ink, fontWeight: 500, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                    <Sparkles size={16} color={C.ember} />
                    Avalanche USDC Faucet
                  </h4>
                  <p style={{ fontSize: 11, color: C.inkDim, lineHeight: 1.5, marginBottom: 16 }}>
                    Obtain mock USDC to your wallet to test tokenized stock purchases locally.
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <input
                      type="number"
                      value={faucetAmount}
                      onChange={(e) => setFaucetAmount(e.target.value)}
                      style={{
                        width: 100, padding: "10px", border: `1px solid ${C.border}`,
                        borderRadius: 10, background: C.bg, outline: "none", fontSize: 13, ...mono,
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleFaucetClaim}
                      disabled={isFaucetLoading || !faucetAmount}
                      style={{
                        flex: 1, padding: "10px", borderRadius: 10,
                        background: C.ink, color: C.bg, fontWeight: 600, fontSize: 12, cursor: "pointer", border: "none",
                      }}
                    >
                      {isFaucetLoading ? "Claiming..." : "Mint Mock USDC"}
                    </button>
                  </div>
                </div>

                {/* Deployed Address Info */}
                <div>
                  <h4 style={{ ...serif, fontSize: 16, color: C.ink, fontWeight: 500, marginBottom: 12 }}>Contract Diagnostics</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      ["Platform Contract", deployedAddresses.StockwavePlatform],
                      ["USDC Token Contract", deployedAddresses.MockUSDC],
                      ["Backend Signer", deployedAddresses.OracleSigner],
                    ].map(([label, addr]) => (
                      <div key={label} style={{ padding: "10px 12px", background: C.card, borderRadius: 8, fontSize: 11, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: C.inkDim, fontWeight: 500 }}>{label}</span>
                        <span style={{ ...mono, color: C.inkMute }}>{addr ? addr.slice(0, 8) + "..." + addr.slice(-6) : "Not Loaded"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
        <TabBar />
      </div>
    </div>
  );
}
