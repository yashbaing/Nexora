import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import jwt from "jsonwebtoken";
import { ethers } from "ethers";
import dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

import pool, { initDb } from "./db";
import {
  startHyperliquidWS,
  setIoInstance,
  priceCache,
  getStockCandles,
  STOCK_METADATA,
  initScaling,
} from "./hyperliquid";
import { signTradeQuote } from "./signer";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "stockwave_web3_secret_2026";
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// Set socket io reference in Hyperliquid provider
setIoInstance(io);

// Load deployed contract address mappings
let addresses: any = {};
const loadAddresses = () => {
  try {
    const filePath = path.join(__dirname, "../../deployed-addresses.json");
    if (fs.existsSync(filePath)) {
      addresses = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch (e) {
    console.warn("⚠️ Warning: deployed-addresses.json not found yet.");
  }
};
loadAddresses();

// Serve deployed-addresses.json for frontend dynamic config
app.get("/deployed-addresses.json", (_req: Request, res: Response) => {
  const filePath = path.join(__dirname, "../../deployed-addresses.json");
  if (fs.existsSync(filePath)) {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.send(fs.readFileSync(filePath, "utf8"));
  } else {
    res.status(404).json({ error: "deployed-addresses.json not found" });
  }
});

// Setup ethers provider
const provider = new ethers.JsonRpcProvider(RPC_URL);

// ── Auth middleware ───────────────────────────────────────────────────────────
export interface AuthRequest extends Request {
  userId?: string; // wallet address
}

const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { address: string };
    req.userId = decoded.address.toLowerCase();
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ── Web3 Auth Route ───────────────────────────────────────────────────────────
app.post("/api/auth/web3-login", async (req: Request, res: Response) => {
  try {
    const { address, signature, message, name } = req.body;
    if (!address || !signature || !message) {
      return res.status(400).json({ error: "Missing address, signature, or message" });
    }

    // Verify wallet signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: "Signature verification failed" });
    }

    const walletAddress = address.toLowerCase();

    // Check if user exists in PG
    const userRes = await pool.query("SELECT * FROM users WHERE id = $1", [walletAddress]);
    let user = userRes.rows[0];

    if (!user) {
      // Auto register
      const userName = name || `Trader_${walletAddress.slice(2, 8)}`;
      const email = `${walletAddress.slice(2, 10)}@stockwave.internal`;
      const insertRes = await pool.query(
        "INSERT INTO users (id, name, email) VALUES ($1, $2, $3) RETURNING *",
        [walletAddress, userName, email]
      );
      user = insertRes.rows[0];
    }

    const token = jwt.sign({ address: walletAddress }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      message: "Logged in successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/google-login", async (req: Request, res: Response) => {
  try {
    const { email, name } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Missing email" });
    }

    // Derive a deterministic private key from the Google email
    const derivedKey = ethers.keccak256(ethers.toUtf8Bytes("google-account-key-derivation-salt-2026:" + email.toLowerCase()));
    const wallet = new ethers.Wallet(derivedKey);
    const walletAddress = wallet.address.toLowerCase();

    // Check if user exists in database
    const userRes = await pool.query("SELECT * FROM users WHERE id = $1", [walletAddress]);
    let user = userRes.rows[0];

    if (!user) {
      // Auto register user in database
      const userName = name || email.split("@")[0];
      const insertRes = await pool.query(
        "INSERT INTO users (id, name, email) VALUES ($1, $2, $3) RETURNING *",
        [walletAddress, userName, email.toLowerCase()]
      );
      user = insertRes.rows[0];

      // Auto fund derived wallet with AVAX gas if connected to Fuji or local node
      try {
        const deployerKey = process.env.ORACLE_PRIVATE_KEY;
        if (deployerKey) {
          const deployer = new ethers.Wallet(deployerKey, provider);
          const balance = await provider.getBalance(walletAddress);
          if (balance < ethers.parseEther("0.005")) {
            console.log(`💸 Auto-funding Google user embedded wallet (${walletAddress}) with 0.005 AVAX gas...`);
            const tx = await deployer.sendTransaction({
              to: walletAddress,
              value: ethers.parseEther("0.005")
            });
            await tx.wait();
            console.log(`✅ Funded Google user ${email} successfully.`);
          }
        }
      } catch (fundErr: any) {
        console.warn("⚠️ Warning: Failed to auto-fund derived wallet with gas:", fundErr.message);
      }
    }

    const token = jwt.sign({ address: walletAddress }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      message: "Logged in with Google successfully",
      token,
      privateKey: derivedKey,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/auth/google-api-login", async (req: Request, res: Response) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: "Missing credential" });
    }

    const parts = credential.split(".");
    if (parts.length !== 3) {
      return res.status(400).json({ error: "Invalid credential token format" });
    }

    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf-8"));
    const email = payload.email;
    const name = payload.name || email.split("@")[0];

    if (!email) {
      return res.status(400).json({ error: "Email not found in token" });
    }

    // Derive a deterministic private key from the Google email
    const derivedKey = ethers.keccak256(ethers.toUtf8Bytes("google-account-key-derivation-salt-2026:" + email.toLowerCase()));
    const wallet = new ethers.Wallet(derivedKey);
    const walletAddress = wallet.address.toLowerCase();

    // Check if user exists in database
    const userRes = await pool.query("SELECT * FROM users WHERE id = $1", [walletAddress]);
    let user = userRes.rows[0];

    if (!user) {
      // Auto register user in database
      const insertRes = await pool.query(
        "INSERT INTO users (id, name, email) VALUES ($1, $2, $3) RETURNING *",
        [walletAddress, name, email.toLowerCase()]
      );
      user = insertRes.rows[0];

      // Auto fund derived wallet with AVAX gas
      try {
        const deployerKey = process.env.ORACLE_PRIVATE_KEY;
        if (deployerKey) {
          const deployer = new ethers.Wallet(deployerKey, provider);
          const balance = await provider.getBalance(walletAddress);
          if (balance < ethers.parseEther("0.005")) {
            console.log(`💸 Auto-funding Google API user embedded wallet (${walletAddress}) with 0.005 AVAX gas...`);
            const tx = await deployer.sendTransaction({
              to: walletAddress,
              value: ethers.parseEther("0.005")
            });
            await tx.wait();
            console.log(`✅ Funded Google API user ${email} successfully.`);
          }
        }
      } catch (fundErr: any) {
        console.warn("⚠️ Warning: Failed to auto-fund derived wallet with gas:", fundErr.message);
      }
    }

    const token = jwt.sign({ address: walletAddress }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      message: "Logged in with Google API successfully",
      token,
      privateKey: derivedKey,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Stock Listing Routes ──────────────────────────────────────────────────────
const normalizeSymbol = (sym: string): string => {
  if (!sym) return "";
  const uppercase = sym.toUpperCase();
  if (uppercase.startsWith("X")) {
    return "x" + uppercase.slice(1);
  }
  return uppercase;
};

app.get("/api/stocks", (req: Request, res: Response) => {
  res.json(Object.values(priceCache));
});

app.get("/api/stocks/:symbol", (req: Request, res: Response) => {
  const symbol = normalizeSymbol(req.params.symbol);
  const stock = priceCache[symbol];
  if (!stock) return res.status(404).json({ error: "Stock not found" });
  res.json(stock);
});

app.get("/api/stocks/:symbol/candles", async (req: Request, res: Response) => {
  try {
    const symbol = normalizeSymbol(req.params.symbol);
    const interval = (req.query.interval as string) || "1h";
    const limit = parseInt((req.query.limit as string) || "200");
    const candles = await getStockCandles(symbol, interval, limit);
    res.json(candles);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Watchlist Routes ──────────────────────────────────────────────────────────
app.get("/api/user/watchlist", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const result = await pool.query("SELECT symbol FROM watchlists WHERE user_id = $1", [userId]);
    res.json(result.rows.map((row) => row.symbol));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/user/watchlist/toggle", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const { symbol } = req.body;
    if (!symbol) return res.status(400).json({ error: "Symbol is required" });

    const check = await pool.query(
      "SELECT * FROM watchlists WHERE user_id = $1 AND symbol = $2",
      [userId, symbol]
    );

    if (check.rows.length > 0) {
      await pool.query("DELETE FROM watchlists WHERE user_id = $1 AND symbol = $2", [userId, symbol]);
      res.json({ status: "removed", symbol });
    } else {
      await pool.query("INSERT INTO watchlists (user_id, symbol) VALUES ($1, $2)", [userId, symbol]);
      res.json({ status: "added", symbol });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Trade Signer Quote Route ──────────────────────────────────────────────────
app.post("/api/trades/quote", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userAddress = req.userId!;
    const { symbol, qty, side } = req.body;

    if (!symbol || !qty || !side) {
      return res.status(400).json({ error: "Missing symbol, qty, or side" });
    }

    loadAddresses();
    const platformContractAddress = addresses.StockwavePlatform;
    if (!platformContractAddress) {
      return res.status(500).json({ error: "StockwavePlatform contract address not deployed yet" });
    }

    const stock = priceCache[symbol.toUpperCase()];
    if (!stock) return res.status(404).json({ error: "Stock not found" });

    // 1. Fetch current price from cache, represent in 6 decimals for smart contract
    const currentPrice = stock.price;
    const contractPrice = Math.round(currentPrice * 10**6);

    // 2. Quantity is represented in 18 decimals on-chain
    const contractQty = ethers.parseEther(qty).toString();

    // 3. Expiry deadline set to 5 minutes from now
    const deadline = Math.floor(Date.now() / 1000) + 300;

    // 4. Fetch the user's current nonce directly from the blockchain
    const platformAbi = ["function nonces(address) view returns (uint256)"];
    const platformContract = new ethers.Contract(platformContractAddress, platformAbi, provider);
    const nonce = await platformContract.nonces(userAddress);

    // 5. Sign the payload EIP-712
    const signature = await signTradeQuote(
      userAddress,
      symbol,
      contractQty,
      contractPrice,
      deadline,
      Number(nonce)
    );

    res.json({
      symbol,
      qty,
      price: currentPrice,
      contractPrice,
      contractQty,
      deadline,
      nonce: nonce.toString(),
      signature,
      platformAddress: platformContractAddress,
    });
  } catch (err: any) {
    console.error("❌ Sign Quote Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── On-chain Trade Sync Route ─────────────────────────────────────────────────
app.post("/api/trades/sync", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const { txHash } = req.body;
    if (!txHash) return res.status(400).json({ error: "txHash is required" });

    console.log(`🔄 Syncing transaction ${txHash}...`);
    const receipt = await provider.waitForTransaction(txHash);
    
    if (!receipt || receipt.status !== 1) {
      return res.status(400).json({ error: "Transaction failed or not found on-chain" });
    }

    loadAddresses();
    const platformContractAddress = addresses.StockwavePlatform;

    // Define Contract Event ABI
    const platformInterface = new ethers.Interface([
      "event StockBought(address indexed user, string symbol, uint256 qty, uint256 price, uint256 usdcSpent, uint256 timestamp)",
      "event StockSold(address indexed user, string symbol, uint256 qty, uint256 price, uint256 usdcReceived, uint256 timestamp)"
    ]);

    let tradeEventParsed: any = null;

    // Parse transaction logs
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() === platformContractAddress.toLowerCase()) {
        try {
          const parsed = platformInterface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });

          if (parsed && (parsed.name === "StockBought" || parsed.name === "StockSold")) {
            tradeEventParsed = {
              name: parsed.name,
              user: parsed.args[0].toLowerCase(),
              symbol: parsed.args[1],
              qty: ethers.formatEther(parsed.args[2]), // qty parsed to string float
              price: (Number(parsed.args[3]) / 10**6).toString(), // price in USD
              amount: (Number(parsed.args[4]) / 10**6).toString(), // usdc spent/received
              timestamp: new Date(Number(parsed.args[5]) * 1000),
            };
            break;
          }
        } catch (e) {
          // ignore parsing error for non-matching events
        }
      }
    }

    if (!tradeEventParsed) {
      return res.status(400).json({ error: "No matching StockBought/StockSold events in transaction logs" });
    }

    const { name, user, symbol, qty, price, amount, timestamp } = tradeEventParsed;
    const type = name === "StockBought" ? "BUY" : "SELL";

    // Insert transaction to DB
    await pool.query(
      `INSERT INTO transactions (id, user_id, type, symbol, qty, price, amount, timestamp)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO NOTHING`,
      [txHash, user, type, symbol, qty, price, amount, timestamp]
    );

    // Update portfolios table
    const portfolioRes = await pool.query(
      "SELECT * FROM portfolios WHERE user_id = $1 AND symbol = $2",
      [user, symbol]
    );
    const existing = portfolioRes.rows[0];

    const tradeQtyNum = parseFloat(qty);
    const tradePriceNum = parseFloat(price);

    if (type === "BUY") {
      if (existing) {
        const oldQty = parseFloat(existing.qty);
        const oldAvg = parseFloat(existing.avg_price);
        const newQty = oldQty + tradeQtyNum;
        const newAvg = ((oldQty * oldAvg) + (tradeQtyNum * tradePriceNum)) / newQty;

        await pool.query(
          "UPDATE portfolios SET qty = $1, avg_price = $2 WHERE user_id = $3 AND symbol = $4",
          [newQty, newAvg, user, symbol]
        );
      } else {
        await pool.query(
          "INSERT INTO portfolios (user_id, symbol, qty, avg_price) VALUES ($1, $2, $3, $4)",
          [user, symbol, tradeQtyNum, tradePriceNum]
        );
      }
    } else if (type === "SELL") {
      if (existing) {
        const oldQty = parseFloat(existing.qty);
        const newQty = Math.max(0, oldQty - tradeQtyNum);

        if (newQty <= 0.0001) {
          await pool.query("DELETE FROM portfolios WHERE user_id = $1 AND symbol = $2", [user, symbol]);
        } else {
          await pool.query(
            "UPDATE portfolios SET qty = $1 WHERE user_id = $2 AND symbol = $3",
            [newQty, user, symbol]
          );
        }
      }
    }

    res.json({ message: "Transaction synchronized successfully", event: tradeEventParsed });
  } catch (err: any) {
    console.error("❌ Sync Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ── Trade History & Portfolio Listing ───────────────────────────────────────────
app.get("/api/trades/history", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const result = await pool.query(
      "SELECT * FROM transactions WHERE user_id = $1 ORDER BY timestamp DESC",
      [userId]
    );
    // Format response to match mockup key names
    const formatted = result.rows.map((row) => ({
      type: row.type.toLowerCase(),
      symbol: row.symbol,
      qty: parseFloat(row.qty),
      amount: parseFloat(row.amount),
      price: parseFloat(row.price),
      when: new Date(row.timestamp).toLocaleDateString() + " " + new Date(row.timestamp).toLocaleTimeString(),
      txHash: row.id,
    }));
    res.json(formatted);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/portfolio", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    // Fetch cached holdings from DB
    const holdingsRes = await pool.query(
      "SELECT symbol, qty, avg_price FROM portfolios WHERE user_id = $1",
      [userId]
    );

    // Call MockUSDC directly on-chain to get cash balance
    loadAddresses();
    const usdcAddress = addresses.MockUSDC;
    let cashBalance = 0;
    
    if (usdcAddress) {
      const usdcAbi = ["function balanceOf(address) view returns (uint256)"];
      const usdcContract = new ethers.Contract(usdcAddress, usdcAbi, provider);
      const balance = await usdcContract.balanceOf(userId);
      cashBalance = Number(balance) / 10**6; // Convert 6 decimals to float
    }

    const holdings = holdingsRes.rows.map((row) => {
      const sym = row.symbol;
      const meta = STOCK_METADATA[sym];
      return {
        symbol: sym,
        name: meta ? meta.name : sym,
        qty: parseFloat(row.qty),
        avgPrice: parseFloat(row.avg_price),
        currency: meta ? meta.currency : "USD",
      };
    });

    // Mock response for other assets in DEX (like ETH, USDC etc.)
    const web3 = {
      address: userId,
      balances: {
        ETH: 1.5, // stub Web3 values for layout purposes
        USDC: cashBalance,
      },
      holdings: [],
    };

    res.json({
      holdings,
      cash: cashBalance,
      web3,
    });
  } catch (err: any) {
    console.error("❌ Portfolio fetch error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/user/profile", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [userId]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/deployed-addresses.json", (req: Request, res: Response) => {
  try {
    const filePath = path.join(__dirname, "../../deployed-addresses.json");
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
      res.json(data);
    } else {
      res.status(404).json({ error: "deployed-addresses.json not found yet" });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Start service
const PORT = process.env.PORT || 5001;

const startServer = async () => {
  try {
    // 1. Init Database
    await initDb();

    // 2. Init Dynamic Price Scaling
    await initScaling();

    // 3. Start WebSocket feeds
    startHyperliquidWS();

    // 3. Listen Express
    server.listen(PORT, () => {
      console.log(`✅ Stockwave TypeScript Backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Server startup failed:", err);
    process.exit(1);
  }
};

startServer();
