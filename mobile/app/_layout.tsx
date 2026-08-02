import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { WalletProvider, useWallet } from "@/src/WalletContext";
import { MarketProvider } from "@/src/MarketContext";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isConnected } = useWallet();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const onLogin = segments[0] === "login";
    if (!isConnected && !onLogin) router.replace("/login");
    if (isConnected && onLogin) router.replace("/(tabs)");
  }, [isConnected, segments, router]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <WalletProvider>
      <MarketProvider>
        <AuthGate>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="stock/[symbol]"
              options={{ headerShown: true, title: "Trade", presentation: "card" }}
            />
          </Stack>
        </AuthGate>
      </MarketProvider>
    </WalletProvider>
  );
}
