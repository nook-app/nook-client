import { Redirect, Tabs } from "expo-router";

import { useAuth } from "../../context/auth";
import { Image, View } from "tamagui";
import { Home } from "@tamagui/lucide-icons";
import { useAppSelector } from "../../hooks/useAppSelector";
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
            theme="pink"
            height="100%"
            borderTopWidth="$0.5"
            borderTopColor="$borderColor"
          />
        ),
        tabBarLabel: () => <></>,
        tabBarIcon: () => {
          if (route.name === "nooks") {
            return <Home size={24} />;
          }
          if (route.name === "profile") {
            return (
              <Image
                source={{
                  width: 32,
                  height: 32,
                  uri: session?.entity?.farcaster?.pfp,
                }}
                borderRadius="$10"
              />
            );
          }
          return <></>;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="nooks" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
