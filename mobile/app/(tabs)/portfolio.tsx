import { useMemo } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useMarket } from "@/src/MarketContext";
import { useWallet } from "@/src/WalletContext";
import { C, fmtUSD } from "@/src/theme";
import { Muted, Screen, Title } from "@/src/components/ui";

export default function PortfolioScreen() {
  const router = useRouter();
  const { stocks, portfolio } = useMarket();
  const { usdcBalance } = useWallet();

  const rows = useMemo(
    () =>
      portfolio.holdings.map((h) => {
        const s = stocks.find((x) => x.symbol === h.symbol);
        const price = s?.price ?? h.avgPrice;
        const value = h.qty * price;
        const pnl = h.avgPrice > 0 ? ((price - h.avgPrice) / h.avgPrice) * 100 : 0;
        return { ...h, price, value, pnl, name: s?.name || h.symbol };
      }),
    [portfolio, stocks]
  );

  return (
    <Screen>
      <Title>Holdings</Title>
      <Muted>Cash balance {fmtUSD(portfolio.cash || usdcBalance)}</Muted>
      <FlatList
        data={rows}
        keyExtractor={(h) => h.symbol}
        ListEmptyComponent={<Muted>No positions yet. Buy a stock from Markets.</Muted>}
        renderItem={({ item }) => {
          const up = item.pnl >= 0;
          return (
            <Pressable
              onPress={() => router.push(`/stock/${item.symbol}`)}
              style={{
                paddingVertical: 14,
                borderBottomWidth: 1,
                borderBottomColor: C.border,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text style={{ fontWeight: "700", color: C.ink }}>{item.symbol}</Text>
                <Text style={{ color: C.inkMute, fontSize: 12, marginTop: 2 }}>
                  {item.qty.toFixed(4)} tokens · avg {fmtUSD(item.avgPrice)}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontWeight: "600", color: C.ink }}>{fmtUSD(item.value)}</Text>
                <Text style={{ color: up ? C.gain : C.loss, fontSize: 12, fontWeight: "600" }}>
                  {up ? "+" : ""}
                  {item.pnl.toFixed(2)}%
                </Text>
              </View>
            </Pressable>
          );
        }}
      />
    </Screen>
  );
}
