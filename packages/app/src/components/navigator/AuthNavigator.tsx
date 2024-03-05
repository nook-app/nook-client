import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Avatar, Text, View, useTheme } from "tamagui";
import { ElementType, memo } from "react";
import {
  Bell,
  LayoutGrid,
  Plus,
  PlusCircle,
  Search,
} from "@tamagui/lucide-icons";
import { useAppSelector } from "@/hooks/useAppSelector";
import { NooksNavigator } from "./NooksNavigator";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { useModal } from "@/hooks/useModal";
import { ModalName } from "@/modals/types";

const Tabs = createBottomTabNavigator();

export const AuthNavigator = () => {
  const { open } = useModal(ModalName.CreatePost);
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
        name="Create"
        component={TempSearchScreen}
        options={{
          title: "Nooks",
          tabBarIcon: ({ focused }) => (
            <TabBarIcon
              focused={focused}
              icon={Plus}
              focusType="stroke"
              invert
            />
          ),
          tabBarShowLabel: false,
        }}
        listeners={({ navigation }) => ({
          tabPress: (event) => {
            event.preventDefault();
            open();
          },
        })}
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
    invert,
  }: {
    focused: boolean;
    icon: ElementType;
    focusType: "stroke" | "fill";
    invert?: boolean;
  }) => {
    const theme = useTheme();
    return (
      <View
        themeInverse={!!invert}
        backgroundColor="$backgroundStrong"
        borderRadius="$10"
        padding="$2"
      >
        <Icon
          size={20}
          color={focused && !invert ? "white" : invert ? "$color12" : "$gray11"}
          strokeWidth={focused && focusType === "stroke" && !invert ? 3 : 2}
          fill={
            focused && focusType === "fill" && !invert
              ? "white"
              : theme.$backgroundStrong.val
          }
        />
      </View>
    );
  },
);

const TabBarUserImage = memo(() => {
  const user = useAppSelector((state) => state.auth.user);
  return (
    <Avatar circular size="$1.5">
      <Avatar.Image source={{ uri: user?.pfp || undefined }} />
      <Avatar.Fallback backgroundColor="$backgroundStrong" />
    </Avatar>
  );
});
