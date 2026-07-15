import WebSocket from "ws";
import axios from "axios";
import { Server as SocketIOServer } from "socket.io";

export interface StockPriceInfo {
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

export const STOCK_METADATA: {
  [symbol: string]: {
    name: string;
    sector: string;
    currency: string;
    region: string;
    coin: string;
    scale: number;
    targetPrice: number;
    marketCap: string;
    volume: string;
  }
} = {
  xAAPL: { name: "Apple Inc.", sector: "Tech", currency: "USD", region: "US", coin: "BTC", scale: 0.005, targetPrice: 314.96, marketCap: "4.82T", volume: "48.2M" },
  xTSLA: { name: "Tesla Inc.", sector: "Auto", currency: "USD", region: "US", coin: "ETH", scale: 0.1, targetPrice: 393.99, marketCap: "1.23T", volume: "92.5M" },
  xNVDA: { name: "NVIDIA Corp.", sector: "Tech", currency: "USD", region: "US", coin: "SOL", scale: 2.0, targetPrice: 207.40, marketCap: "5.12T", volume: "210.4M" },
  xMSFT: { name: "Microsoft Corp.", sector: "Tech", currency: "USD", region: "US", coin: "AVAX", scale: 12.0, targetPrice: 385.66, marketCap: "3.24T", volume: "16.2M" },
  xGOOGL: { name: "Alphabet Inc.", sector: "Tech", currency: "USD", region: "US", coin: "NEAR", scale: 45.0, targetPrice: 355.89, marketCap: "2.12T", volume: "22.1M" },
  xAMZN: { name: "Amazon.com Inc.", sector: "Tech", currency: "USD", region: "US", coin: "ARB", scale: 190.0, targetPrice: 185.00, marketCap: "2.26T", volume: "31.2M" },
  xMETA: { name: "Meta Platforms", sector: "Tech", currency: "USD", region: "US", coin: "OP", scale: 320.0, targetPrice: 660.31, marketCap: "1.68T", volume: "12.4M" },
  xRELI: { name: "Reliance Industries", sector: "Energy", currency: "INR", region: "IN", coin: "POL", scale: 1500.0, targetPrice: 1297.00, marketCap: "10.4T", volume: "9.1M" },
  xTCS: { name: "Tata Consultancy", sector: "Tech", currency: "INR", region: "IN", coin: "ADA", scale: 4000.0, targetPrice: 2069.00, marketCap: "7.6T", volume: "2.8M" },
  xJPM: { name: "JPMorgan Chase", sector: "Finance", currency: "USD", region: "US", coin: "XRP", scale: 310.0, targetPrice: 333.23, marketCap: "964B", volume: "8.5M" },
  xKO: { name: "Coca-Cola Co.", sector: "Consumer", currency: "USD", region: "US", coin: "DOGE", scale: 600.0, targetPrice: 82.52, marketCap: "356B", volume: "12.8M" },
  xINFY: { name: "Infosys Ltd.", sector: "Tech", currency: "USD", region: "US", coin: "LTC", scale: 0.15, targetPrice: 10.94, marketCap: "45.2B", volume: "4.2M" },
};

export const priceCache: { [symbol: string]: StockPriceInfo } = {};

// Initialize cache synchronously on module load
Object.entries(STOCK_METADATA).forEach(([symbol, meta]) => {
  priceCache[symbol] = {
    symbol,
    name: meta.name,
    sector: meta.sector,
    currency: meta.currency,
    region: meta.region,
    price: meta.targetPrice,
    change: 0,
    changePercent: 0,
    marketCap: meta.marketCap,
    volume: meta.volume,
    dayHigh: meta.targetPrice,
    dayLow: meta.targetPrice,
  };
});

let ioInstance: SocketIOServer | null = null;

export const setIoInstance = (io: SocketIOServer) => {
  ioInstance = io;
};

// Initialize scaling factors dynamically from Hyperliquid mids
export const initScaling = async () => {
  try {
    console.log("📈 Initializing dynamic price scaling factors based on actual stock prices...");
    const url = "https://api.hyperliquid.xyz/info";
    const response = await axios.post(url, { type: "allMids" });
    if (response.data) {
      const mids = response.data;
      Object.entries(STOCK_METADATA).forEach(([symbol, meta]) => {
        const coinPriceStr = mids[meta.coin];
        if (coinPriceStr) {
          const coinPrice = parseFloat(coinPriceStr);
          if (coinPrice > 0) {
            meta.scale = meta.targetPrice / coinPrice;
            console.log(`✅ Scaled ${symbol} to match real price of ${meta.targetPrice} (Coin: ${meta.coin}, Price: ${coinPrice.toFixed(2)}, Dynamic Scale: ${meta.scale.toFixed(6)})`);
          }
        }
      });
    }
  } catch (err: any) {
    console.warn("⚠️ Failed to load live mids for scaling initialization. Falling back to default static scales. Error:", err.message);
  }
};

// Start Hyperliquid WebSocket feed
export const startHyperliquidWS = () => {
  const wsUrl = "wss://api.hyperliquid.xyz/ws";
  console.log(`🔌 Connecting to Hyperliquid WebSocket: ${wsUrl}`);
  
  const ws = new WebSocket(wsUrl);

  ws.on("open", () => {
    console.log("✅ Hyperliquid WS Connected. Subscribing to allMids...");
    ws.send(
      JSON.stringify({
        method: "subscribe",
        subscription: { type: "allMids" },
      })
    );
  });

  ws.on("message", (data: WebSocket.Data) => {
    try {
      const message = JSON.parse(data.toString());
      if (message.channel === "allMids" && message.data && message.data.mids) {
        const mids = message.data.mids;
        let cacheUpdated = false;

        Object.entries(STOCK_METADATA).forEach(([symbol, meta]) => {
          const cryptoPriceStr = mids[meta.coin];
          if (cryptoPriceStr) {
            const cryptoPrice = parseFloat(cryptoPriceStr);
            const scaledPrice = parseFloat((cryptoPrice * meta.scale).toFixed(2));
            const oldPrice = priceCache[symbol].price;

            if (oldPrice !== scaledPrice) {
              const diff = scaledPrice - oldPrice;
              priceCache[symbol].price = scaledPrice;
              priceCache[symbol].change = parseFloat((priceCache[symbol].change + diff).toFixed(2));
              
              const baselinePrice = scaledPrice - priceCache[symbol].change;
              priceCache[symbol].changePercent = baselinePrice > 0 
                ? parseFloat(((priceCache[symbol].change / baselinePrice) * 100).toFixed(2))
                : 0;

              priceCache[symbol].dayHigh = Math.max(priceCache[symbol].dayHigh, scaledPrice);
              priceCache[symbol].dayLow = priceCache[symbol].dayLow === meta.targetPrice 
                ? scaledPrice 
                : Math.min(priceCache[symbol].dayLow, scaledPrice);
              
              cacheUpdated = true;
            }
          }
        });

        if (cacheUpdated && ioInstance) {
          const updates: { [symbol: string]: any } = {};
          Object.entries(priceCache).forEach(([symbol, cache]) => {
            updates[symbol] = {
              price: cache.price,
              change: cache.change,
              changePercent: cache.changePercent,
              dayHigh: cache.dayHigh,
              dayLow: cache.dayLow,
              marketCap: cache.marketCap,
              volume: cache.volume,
              currency: cache.currency,
            };
          });
          ioInstance.emit("prices_update", updates);
        }
      }
    } catch (err) {
      console.error("❌ Error parsing Hyperliquid WebSocket message:", err);
    }
  });

  ws.on("close", () => {
    console.warn("⚠️ Hyperliquid WS closed. Reconnecting in 5 seconds...");
    setTimeout(startHyperliquidWS, 5000);
  });

  ws.on("error", (err) => {
    console.error("❌ Hyperliquid WS error:", err);
  });
};

// Fetch historical candles from Hyperliquid info API
export const getStockCandles = async (symbol: string, interval: string = "1h", limit: number = 200) => {
  const meta = STOCK_METADATA[symbol];
  if (!meta) throw new Error("Stock symbol not supported");

  const url = "https://api.hyperliquid.xyz/info";
  const endTime = Date.now();
  
  const intervalMsMap: { [key: string]: number } = {
    "1m": 60 * 1000,
    "5m": 5 * 60 * 1000,
    "15m": 15 * 60 * 1000,
    "1h": 60 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
  };
  const msPerBar = intervalMsMap[interval] || intervalMsMap["1h"];
  const startTime = endTime - limit * msPerBar;

  console.log(`🕯️ Fetching candles for ${meta.coin} (mapped from ${symbol}) via Hyperliquid...`);
  const response = await axios.post(url, {
    type: "candleSnapshot",
    req: {
      coin: meta.coin,
      interval,
      startTime,
      endTime,
    },
  });

  if (!Array.isArray(response.data)) {
    throw new Error("Invalid candles data returned from Hyperliquid");
  }

  return response.data.map((c: any, index: number) => {
    const o = parseFloat(c.o) * meta.scale;
    const h = parseFloat(c.h) * meta.scale;
    const l = parseFloat(c.l) * meta.scale;
    const cl = parseFloat(c.c) * meta.scale;
    return {
      i: index,
      time: c.t,
      open: parseFloat(o.toFixed(2)),
      high: parseFloat(h.toFixed(2)),
      low: parseFloat(l.toFixed(2)),
      close: parseFloat(cl.toFixed(2)),
      v: parseFloat(cl.toFixed(2)),
    };
  });
};
