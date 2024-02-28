import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Avatar, Text, View, useTheme } from "tamagui";
import { ElementType, memo } from "react";
import { Bell, LayoutGrid, Search } from "@tamagui/lucide-icons";
import { useAppSelector } from "@/hooks/useAppSelector";
import { NooksNavigator } from "./NooksNavigator";
import { ProfileScreen } from "@/screens/ProfileScreen";

const Tabs = createBottomTabNavigator();

export const AuthNavigator = () => {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarBackground: () => <TabBarBackground />,
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
            <TabBarIcon focused={focused} icon={LayoutGrid} focusType="fill" />
          ),
          tabBarShowLabel: false,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            const currentRoute = state.routes[state.index];
            if (currentRoute.name === "Nooks") {
              if (currentRoute.state?.routes[0].state?.routes.length > 1) {
                e.preventDefault();
                navigation.popToTop();
              }
            }
          },
        })}
      />
      <Tabs.Screen
        name="Search"
        component={TempSearchScreen}
        options={{
          title: "Nooks",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={Search} focusType="stroke" />
          ),
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="Notifications"
        component={TempNotificationsScreen}
        options={{
          title: "Nooks",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon={Bell} focusType="fill" />
          ),
          tabBarShowLabel: false,
        }}
      />
      <Tabs.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: () => <TabBarUserImage />,
          tabBarShowLabel: false,
        }}
      />
    </Tabs.Navigator>
  );
};

export const TempSearchScreen = () => {
  return (
    <View>
      <Text>Search</Text>
    </View>
  );
};

export const TempNotificationsScreen = () => {
  return (
    <View>
      <Text>Notifications</Text>
    </View>
  );
};

const TabBarBackground = memo(() => {
  return (
    <View
      backgroundColor="$backgroundStrong"
      height="100%"
      borderTopWidth="$0.5"
      borderTopColor="$borderColor"
    />
  );
});

const TabBarIcon = memo(
  ({
    focused,
    icon: Icon,
    focusType,
  }: { focused: boolean; icon: ElementType; focusType: "stroke" | "fill" }) => {
    const theme = useTheme();
    return (
      <Icon
        size={20}
        color={focused ? "white" : "$gray11"}
        strokeWidth={focused && focusType === "stroke" ? 3 : 2}
        fill={
          focused && focusType === "fill"
            ? "white"
            : theme.$backgroundStrong.val
        }
      />
    );
  },
);

const TabBarUserImage = memo(() => {
  const entity = useAppSelector((state) => state.user.entity);
  return (
    <Avatar circular size="$1.5">
      <Avatar.Image source={{ uri: entity?.farcaster.pfp || undefined }} />
      <Avatar.Fallback backgroundColor="$backgroundStrong" />
    </Avatar>
  );
});
