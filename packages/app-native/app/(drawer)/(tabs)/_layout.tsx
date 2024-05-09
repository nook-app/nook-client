import { Loading } from "@nook/app/components/loading";
import { useAuth } from "@nook/app/context/auth";
import { Redirect, Tabs } from "expo-router";
import { Home, Bell } from "@tamagui/lucide-icons";

export default function TabLayout() {
  const { session, isInitializing } = useAuth();

  if (isInitializing) {
    return <Loading />;
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="(home)"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => (
            <Home color={focused ? "red" : "gray"} />
          ),
        }}
      />
      <Tabs.Screen
        name="(notifications)"
        options={{
          title: "Notifications",
          tabBarIcon: ({ focused }) => (
            <Bell color={focused ? "red" : "gray"} />
          ),
        }}
      />
    </Tabs>
  );
}
