import { Text, View } from "react-native";
import { useWallet } from "@/src/WalletContext";
import { NETWORK, USE_MONAD } from "@/src/config";
import { C, fmtUSD } from "@/src/theme";
import { Muted, PrimaryButton, Screen, Title } from "@/src/components/ui";

export default function WalletScreen() {
  const {
    address,
    usdcBalance,
    networkName,
    chainId,
    claimFaucet,
    disconnect,
    refreshUsdc,
  } = useWallet();

  return (
    <Screen>
      <Title>Wallet</Title>
      <Muted>
        {USE_MONAD ? "Monad Testnet" : networkName} · chain {chainId}
      </Muted>

      <View
        style={{
          backgroundColor: C.bg2,
          borderRadius: 18,
          padding: 18,
          borderWidth: 1,
          borderColor: C.border,
          gap: 10,
        }}
      >
        <Text style={{ color: C.inkMute, fontSize: 12, fontWeight: "600" }}>ADDRESS</Text>
        <Text style={{ color: C.ink, fontSize: 13, fontWeight: "600" }} selectable>
          {address}
        </Text>
        <Text style={{ color: C.inkMute, fontSize: 12, fontWeight: "600", marginTop: 8 }}>
          USDC
        </Text>
        <Text style={{ color: C.ink, fontSize: 32, fontWeight: "700" }}>
          {fmtUSD(usdcBalance)}
        </Text>
        <Text style={{ color: C.inkDim, fontSize: 12 }}>
          RPC {NETWORK.rpcUrl.replace("https://", "")}
        </Text>
      </View>

      <View style={{ height: 16 }} />
      <PrimaryButton label="Get test USDC" onPress={claimFaucet} />
      <View style={{ height: 10 }} />
      <PrimaryButton label="Refresh balance" onPress={refreshUsdc} />
      <View style={{ height: 10 }} />
      <PrimaryButton label="Disconnect" onPress={disconnect} danger />
    </Screen>
  );
}
