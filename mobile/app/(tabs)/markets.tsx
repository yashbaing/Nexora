import { useMemo, useState } from "react";
import { FlatList, RefreshControl, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useMarket } from "@/src/MarketContext";
import { C } from "@/src/theme";
import { Muted, Screen, StockRow } from "@/src/components/ui";

export default function MarketsScreen() {
  const router = useRouter();
  const { stocks, loading, refresh } = useMarket();
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return stocks;
    return stocks.filter(
      (s) =>
        s.symbol.toLowerCase().includes(query) ||
        s.name.toLowerCase().includes(query)
    );
  }, [stocks, q]);

  return (
    <Screen>
      <Muted>Tokenized stocks with Hyperliquid-powered quotes</Muted>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder="Search xAAPL, Tesla…"
        placeholderTextColor={C.inkMute}
        style={{
          borderWidth: 1,
          borderColor: C.border,
          backgroundColor: C.bg2,
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 12,
          marginBottom: 8,
          color: C.ink,
        }}
      />
      <FlatList
        data={filtered}
        keyExtractor={(s) => s.symbol}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        renderItem={({ item }) => (
          <StockRow stock={item} onPress={() => router.push(`/stock/${item.symbol}`)} />
        )}
        ListEmptyComponent={<Muted>No markets match your search.</Muted>}
      />
    </Screen>
  );
}
