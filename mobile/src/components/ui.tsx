import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import { C, fmtUSD } from "../theme";
import type { Stock } from "../types";

export function Screen({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={styles.muted}>{children}</Text>;
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  danger,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        danger && { backgroundColor: C.loss },
        (disabled || loading) && { opacity: 0.5 },
        pressed && { opacity: 0.85 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.btnText}>{label}</Text>
      )}
    </Pressable>
  );
}

export function StockRow({
  stock,
  onPress,
}: {
  stock: Stock;
  onPress: () => void;
}) {
  const up = (stock.changePercent ?? 0) >= 0;
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.symbol}>{stock.symbol}</Text>
        <Text style={styles.name} numberOfLines={1}>
          {stock.name}
        </Text>
      </View>
      <View style={{ alignItems: "flex-end" }}>
        <Text style={styles.price}>{fmtUSD(stock.price)}</Text>
        <Text style={{ color: up ? C.gain : C.loss, fontSize: 12, fontWeight: "600" }}>
          {up ? "▲" : "▼"} {up ? "+" : ""}
          {(stock.changePercent ?? 0).toFixed(2)}%
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: C.ink,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  muted: { color: C.inkMute, fontSize: 13, marginBottom: 16 },
  btn: {
    backgroundColor: C.ink,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnText: { color: C.accentInk, fontWeight: "700", fontSize: 14 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
    gap: 12,
  },
  symbol: { fontSize: 15, fontWeight: "700", color: C.ink, fontVariant: ["tabular-nums"] },
  name: { fontSize: 12, color: C.inkMute, marginTop: 2 },
  price: { fontSize: 15, fontWeight: "600", color: C.ink, fontVariant: ["tabular-nums"] },
});
