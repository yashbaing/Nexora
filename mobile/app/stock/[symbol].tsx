import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ethers } from "ethers";
import { useMarket } from "@/src/MarketContext";
import { useWallet } from "@/src/WalletContext";
import { requestQuote, syncTrade } from "@/src/api";
import { ADDRESSES, PLATFORM_ABI, USDC_ABI } from "@/src/config";
import { C, fmtUSD } from "@/src/theme";
import { PrimaryButton } from "@/src/components/ui";

export default function StockScreen() {
  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const navigation = useNavigation();
  const { stocks, refresh } = useMarket();
  const { signer, address, usdcBalance, refreshUsdc } = useWallet();
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [qty, setQty] = useState("1");
  const [busy, setBusy] = useState(false);

  const stock = useMemo(
    () => stocks.find((s) => s.symbol === symbol) || null,
    [stocks, symbol]
  );

  useEffect(() => {
    if (stock) navigation.setOptions({ title: stock.symbol });
  }, [stock, navigation]);

  const cost = (parseFloat(qty) || 0) * (stock?.price || 0);

  const execute = async () => {
    if (!signer || !stock || !ADDRESSES.StockwavePlatform) {
      Alert.alert("Unavailable", "Wallet or contracts not ready.");
      return;
    }
    const qtyFloat = parseFloat(qty);
    if (!qtyFloat || qtyFloat <= 0) {
      Alert.alert("Invalid quantity", "Enter a quantity greater than 0.");
      return;
    }

    try {
      setBusy(true);
      const platformAddress = ADDRESSES.StockwavePlatform;
      const usdc = new ethers.Contract(ADDRESSES.MockUSDC, USDC_ABI, signer);
      const costUnits = ethers.parseUnits(cost.toFixed(6), 6);

      if (side === "buy") {
        const bal = await usdc.balanceOf(address);
        if (bal < costUnits) {
          Alert.alert("Insufficient USDC", `Need ${fmtUSD(cost)}. Use the faucet in Wallet.`);
          return;
        }
        const allowance = await usdc.allowance(address, platformAddress);
        if (allowance < costUnits) {
          const approveTx = await usdc.approve(platformAddress, ethers.MaxUint256);
          await approveTx.wait();
        }
      }

      const quote = await requestQuote(stock.symbol, String(qtyFloat), side);
      const platform = new ethers.Contract(platformAddress, PLATFORM_ABI, signer);
      const tx =
        side === "buy"
          ? await platform.buyStock(
              stock.symbol,
              quote.contractQty,
              quote.contractPrice,
              quote.deadline,
              quote.signature
            )
          : await platform.sellStock(
              stock.symbol,
              quote.contractQty,
              quote.contractPrice,
              quote.deadline,
              quote.signature
            );
      await tx.wait();
      await syncTrade(tx.hash);
      await refresh();
      await refreshUsdc();
      Alert.alert("Trade filled", `${side.toUpperCase()} ${qtyFloat} ${stock.symbol}`);
      setQty("1");
    } catch (e: any) {
      Alert.alert("Trade failed", e?.reason || e?.shortMessage || e?.message || "Try again");
    } finally {
      setBusy(false);
    }
  };

  if (!stock) {
    return (
      <View style={styles.wrap}>
        <Text style={{ color: C.inkMute }}>Loading {symbol}…</Text>
      </View>
    );
  }

  const up = (stock.changePercent ?? 0) >= 0;

  return (
    <ScrollView style={styles.wrap} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.name}>{stock.name}</Text>
      <Text style={styles.price}>{fmtUSD(stock.price)}</Text>
      <Text style={{ color: up ? C.gain : C.loss, fontWeight: "700", marginBottom: 16 }}>
        {up ? "+" : ""}
        {(stock.changePercent ?? 0).toFixed(2)}% today · Hyperliquid feed
      </Text>

      <View style={styles.meta}>
        <Meta label="Market cap" value={stock.marketCap} />
        <Meta label="Volume" value={stock.volume} />
        <Meta label="Day high" value={fmtUSD(stock.dayHigh)} />
        <Meta label="Day low" value={fmtUSD(stock.dayLow)} />
      </View>

      <View style={styles.sideRow}>
        <View style={{ flex: 1, opacity: side === "buy" ? 1 : 0.45 }}>
          <PrimaryButton label="Buy" onPress={() => setSide("buy")} />
        </View>
        <View style={{ width: 10 }} />
        <View style={{ flex: 1, opacity: side === "sell" ? 1 : 0.45 }}>
          <PrimaryButton label="Sell" onPress={() => setSide("sell")} danger />
        </View>
      </View>

      <Text style={styles.label}>Quantity</Text>
      <TextInput
        value={qty}
        onChangeText={setQty}
        keyboardType="decimal-pad"
        style={styles.input}
      />
      <Text style={styles.est}>
        Est. {side} value {fmtUSD(cost)} · Wallet USDC {fmtUSD(usdcBalance)}
      </Text>

      <PrimaryButton
        label={busy ? "Submitting…" : `${side === "buy" ? "Buy" : "Sell"} ${stock.symbol}`}
        onPress={execute}
        loading={busy}
        danger={side === "sell"}
      />
    </ScrollView>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ width: "48%", marginBottom: 10 }}>
      <Text style={{ color: C.inkMute, fontSize: 11 }}>{label}</Text>
      <Text style={{ color: C.ink, fontWeight: "600", marginTop: 2 }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: C.bg },
  name: { color: C.inkMute, fontSize: 13 },
  price: { fontSize: 36, fontWeight: "700", color: C.ink, marginTop: 4, letterSpacing: -0.8 },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: C.bg2,
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  sideRow: { flexDirection: "row", marginBottom: 14 },
  label: { color: C.inkDim, fontWeight: "600", marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: "600",
    color: C.ink,
    marginBottom: 8,
  },
  est: { color: C.inkMute, fontSize: 12, marginBottom: 16 },
});
