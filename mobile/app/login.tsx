import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWallet } from "@/src/WalletContext";
import { NETWORK, USE_MONAD } from "@/src/config";
import { C } from "@/src/theme";
import { Muted, PrimaryButton, Title } from "@/src/components/ui";

export default function LoginScreen() {
  const { connectDemo, loginWithEmail, isConnecting } = useWallet();
  const [email, setEmail] = useState("");

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.wrap}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.brand}>Nexora.</Text>
        <Title>Trade tokenized stocks</Title>
        <Muted>
          Live Hyperliquid prices · {USE_MONAD ? "Monad Testnet" : NETWORK.name}
        </Muted>

        <View style={styles.card}>
          <Text style={styles.label}>Continue with email wallet</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder="you@email.com"
            placeholderTextColor={C.inkMute}
            style={styles.input}
          />
          <PrimaryButton
            label="Sign in"
            loading={isConnecting}
            onPress={() => loginWithEmail(email.trim())}
            disabled={!email.includes("@")}
          />
        </View>

        <View style={{ height: 12 }} />
        <PrimaryButton
          label="Use demo trader wallet"
          loading={isConnecting}
          onPress={connectDemo}
        />

        <Text style={styles.foot}>
          Non-custodial demo wallets · USDC settlement · Chain ID {NETWORK.chainId}
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  wrap: { flex: 1, padding: 24, justifyContent: "center" },
  brand: {
    fontSize: 40,
    fontWeight: "700",
    color: C.ink,
    marginBottom: 12,
    letterSpacing: -1,
  },
  card: {
    backgroundColor: C.bg2,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
    marginTop: 8,
  },
  label: { fontSize: 13, color: C.inkDim, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: C.borderHi,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: C.ink,
    backgroundColor: C.bg,
  },
  foot: {
    marginTop: 24,
    textAlign: "center",
    color: C.inkMute,
    fontSize: 12,
    lineHeight: 18,
  },
});
