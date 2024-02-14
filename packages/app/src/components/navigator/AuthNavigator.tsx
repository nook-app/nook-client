import { useAuth } from "@/context/auth";
import NotificationsScreen from "@/screens/NotficationsScreen";
import ProfileScreen from "@/screens/ProfileScreen";
import {
  BottomTabBar,
  createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { Bell, LayoutGrid } from "@tamagui/lucide-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { Image, Text, View, useTheme } from "tamagui";
import { NooksNavigator } from "./NooksNavigator";
import { useAppSelector } from "@/hooks/useAppSelector";
import { RootStackParamList } from "@/types";

const Tabs = createBottomTabNavigator<RootStackParamList>();

export function AuthNavigator() {
  const { session } = useAuth();
  const theme = useTheme();
  const nooks = useAppSelector((state) => state.user.nooks);
  const isDrawerOpen = useAppSelector((state) => state.drawer.isOpen);

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
    <Tabs.Navigator
      tabBar={(props) => (
        <Animated.View style={animatedStyle}>
          <BottomTabBar {...props} />
        </Animated.View>
      )}
      screenOptions={{
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
      }}
    >
      <Tabs.Screen
        name="Nooks"
        component={NooksNavigator}
        initialParams={{ nookId: nooks[0]?.id }}
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
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Bell
              size={20}
              color={focused ? "white" : "$gray11"}
              fill={focused ? "white" : theme.$gray11.val}
            />
          ),
          tabBarLabel: ({ focused }) => (
            <Text fontSize="$2" color={focused ? undefined : "$gray11"}>
              Notifications
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <Image
              source={{
                width: 24,
                height: 24,
                uri: session?.entity?.farcaster?.pfp,
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
