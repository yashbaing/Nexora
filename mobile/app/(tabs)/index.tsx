import { useMemo } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { useMarket } from "@/src/MarketContext";
import { useWallet } from "@/src/WalletContext";
import { C, fmtUSD } from "@/src/theme";
import { Muted, Screen, StockRow, Title } from "@/src/components/ui";

export default function HomeScreen() {
  const router = useRouter();
  const { stocks, portfolio, loading, refresh } = useMarket();
  const { usdcBalance, networkName } = useWallet();

  const holdingsValue = useMemo(
    () =>
      portfolio.holdings.reduce((sum, h) => {
        const s = stocks.find((x) => x.symbol === h.symbol);
        return sum + h.qty * (s?.price ?? h.avgPrice);
      }, 0),
    [portfolio, stocks]
  );
  const total = holdingsValue + (portfolio.cash || usdcBalance);
  const movers = [...stocks]
    .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
    .slice(0, 6);

  return (
    <Screen>
      <Muted>Hyperliquid live feed · {networkName}</Muted>
      <View
        style={{
          backgroundColor: C.bg2,
          borderRadius: 18,
          padding: 18,
          borderWidth: 1,
          borderColor: C.border,
          marginBottom: 20,
        }}
      >
        <Text style={{ color: C.inkMute, fontSize: 12, fontWeight: "600" }}>PORTFOLIO</Text>
        <Text
          style={{
            color: C.ink,
            fontSize: 34,
            fontWeight: "700",
            marginTop: 6,
            letterSpacing: -0.8,
          }}
        >
          {fmtUSD(total)}
        </Text>
        <Text style={{ color: C.inkDim, marginTop: 6, fontSize: 13 }}>
          Cash {fmtUSD(portfolio.cash || usdcBalance)} · Holdings {fmtUSD(holdingsValue)}
        </Text>
      </View>

      <Title>Top movers</Title>
      <FlatList
        data={movers}
        keyExtractor={(s) => s.symbol}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        renderItem={({ item }) => (
          <StockRow
            stock={item}
            onPress={() => router.push(`/stock/${item.symbol}`)}
          />
        )}
        ListEmptyComponent={<Muted>Loading live prices…</Muted>}
      />
    </Screen>
  );
}
