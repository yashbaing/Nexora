import { Tabs } from "expo-router";
import { Text } from "react-native";
import { C } from "@/src/theme";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: focused ? "700" : "500", color: focused ? C.ink : C.inkMute }}>
      {label}
    </Text>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { fontWeight: "700", color: C.ink },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: C.bg },
        tabBarStyle: {
          backgroundColor: C.bg,
          borderTopColor: C.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon label="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="markets"
        options={{
          title: "Markets",
          tabBarIcon: ({ focused }) => <TabIcon label="Markets" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Portfolio",
          tabBarIcon: ({ focused }) => <TabIcon label="Portfolio" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ focused }) => <TabIcon label="Wallet" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
