import ProfileScreen from "@/screens/ProfileScreen";
import {
  BottomTabBar,
  BottomTabBarProps,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { LayoutGrid } from "@tamagui/lucide-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Image, Text, View, useTheme } from "tamagui";
import { NooksNavigator } from "./NooksNavigator";
import { useAppSelector } from "@/hooks/useAppSelector";
import { RootStackParamList } from "@/types";
import { memo } from "react";

const Tabs = createBottomTabNavigator<RootStackParamList>();

const TabBar = memo((props: BottomTabBarProps) => {
  const isDrawerOpen = useAppSelector((state) => state.navigator.isDrawerOpen);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: withTiming(isDrawerOpen ? 0 : 100, { duration: 250 }) },
      ],
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <BottomTabBar {...props} />
    </Animated.View>
  );
});

export function AuthNavigator() {
  const entity = useAppSelector((state) => state.user.entity);
  const theme = useTheme();

  return (
    <Tabs.Navigator
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarBackground: () => (
          <View
            backgroundColor="$backgroundStrong"
            height="100%"
            borderTopWidth="$0.5"
            borderTopColor="$borderColor"
          />
        ),
        tabBarStyle: {
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="Nooks"
        component={NooksNavigator}
        options={{
          title: "Nooks",
          tabBarIcon: ({ focused }) => (
            <LayoutGrid
              size={20}
              color={focused ? "white" : "$gray11"}
              fill={focused ? "white" : theme.$gray11.val}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text fontSize="$2" color={focused ? undefined : "$gray11"}>
              Nooks
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: () => (
            <Image
              source={{
                width: 24,
                height: 24,
                uri: entity?.farcaster?.pfp,
              }}
              borderRadius="$10"
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text fontSize="$2" color={focused ? undefined : "$gray11"}>
              Profile
            </Text>
          ),
        }}
      />
    </Tabs.Navigator>
  );
}
