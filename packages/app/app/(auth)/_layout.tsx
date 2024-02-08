import { Redirect, Tabs } from "expo-router";

import { useAuth } from "@context/auth";
import { Image, Text, View } from "tamagui";
import { Bell, LayoutGrid } from "@tamagui/lucide-icons";
import { useAppSelector } from "@hooks/useAppSelector";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

export default function AuthedLayout() {
  const { session } = useAuth();
  const isDrawerOpen = useAppSelector((state) => state.drawer.isOpen);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: withTiming(isDrawerOpen ? 0 : 100, { duration: 500 }) },
      ],
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    };
  });

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      tabBar={(props) => (
        <Animated.View style={animatedStyle}>
          <BottomTabBar {...props} />
        </Animated.View>
      )}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarBackground: () => (
          <View
            backgroundColor="$background"
            theme="gray"
            height="100%"
            borderTopWidth="$0.5"
            borderTopColor="$borderColor"
          />
        ),
        tabBarLabel: ({ focused }) => (
          <View>
            <Text fontSize="$2" color={focused ? undefined : "$gray11"}>
              {route.name === "nooks"
                ? "Nooks"
                : route.name === "notifications"
                  ? "Notifications"
                  : route.name === "profile"
                    ? "Profile"
                    : route.name}
            </Text>
          </View>
        ),
        tabBarIcon: ({ focused }) => {
          let component = <></>;
          if (route.name === "nooks") {
            component = (
              <LayoutGrid
                size={20}
                color={focused ? "white" : "$gray11"}
                fill={focused ? "white" : undefined}
              />
            );
          }
          if (route.name === "profile") {
            component = (
              <Image
                source={{
                  width: 24,
                  height: 24,
                  uri: session?.entity?.farcaster?.pfp,
                }}
                borderRadius="$10"
              />
            );
          }
          if (route.name === "notifications") {
            component = (
              <Bell
                size={20}
                color={focused ? "white" : "$gray11"}
                fill={focused ? "white" : undefined}
              />
            );
          }
          return (
            <View
              width="$4"
              height="$4"
              paddingTop="$1"
              justifyContent="center"
              alignItems="center"
            >
              {component}
            </View>
          );
        },
      })}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="nooks" />
      <Tabs.Screen name="notifications" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
