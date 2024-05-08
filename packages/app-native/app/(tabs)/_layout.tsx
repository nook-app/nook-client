import { Loading } from "@nook/app/components/loading";
import { useAuth } from "@nook/app/context/auth";
import { Link, Redirect, Tabs } from "expo-router";
import { Pressable } from "react-native";
import { Text } from "tamagui";

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
        tabBarActiveTintColor: "red",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Tab One",
          tabBarIcon: ({ color }) => <Text>Hello!</Text>,
          headerRight: () => (
            <Link href="/modal" asChild>
              <Pressable>
                <Text>Hello!</Text>
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: "Tab Two",
          tabBarIcon: ({ color }) => <Text>Hello!</Text>,
        }}
      />
    </Tabs>
  );
}
