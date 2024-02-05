import { Redirect, Tabs } from "expo-router";

import { useAuth } from "../../../context/auth";
import { Text, View } from "tamagui";
import { Home } from "@tamagui/lucide-icons";

export default function AuthedLayout() {
  const { session } = useAuth();

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarBackground: () => (
          <View
            backgroundColor="$background"
            theme="pink"
            height="100%"
            borderTopWidth="$0.5"
            borderTopColor="$borderColor"
          />
        ),
        tabBarLabel: () => <></>,
        tabBarIcon: () => {
          if (route.name === "index") {
            return <Home size={24} />;
          }
          return <></>;
        },
      })}
    >
      <Tabs.Screen name="index" />
    </Tabs>
  );
}
