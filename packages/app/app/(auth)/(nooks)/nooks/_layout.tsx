import { Stack } from "expo-router";
import { useNavigation } from "expo-router";

import { View } from "tamagui";
import { PlatformPressable } from "@react-navigation/elements";
import { DrawerActions, ParamListBase } from "@react-navigation/native";
import { Platform } from "react-native";
import {
  DrawerNavigationProp,
  useDrawerStatus,
} from "@react-navigation/drawer";
import { useEffect } from "react";
import { useAppDispatch } from "../../../../hooks/useAppDispatch";
import { setDrawerOpen } from "../../../../store/drawer";
import { ArrowLeft } from "@tamagui/lucide-icons";

export default function NooksLayout() {
  const navigation = useNavigation();

  return (
    <Stack>
      <Stack.Screen
        name="feed/index"
        options={{
          headerLeft: () => <DrawerToggleButton />,
          headerBackground: () => (
            <View backgroundColor="$background" theme="pink" height="100%" />
          ),
          headerTitle: "Home",
        }}
      />
      <Stack.Screen
        name="actions/[id]"
        options={{
          headerBackTitleVisible: false,
          headerTintColor: "white",
          headerBackground: () => (
            <View backgroundColor="$background" theme="pink" height="100%" />
          ),
          headerTitle: "Post",
        }}
      />
    </Stack>
  );
}

const DrawerToggleButton = () => {
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();
  const drawerStatus = useDrawerStatus();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setDrawerOpen(drawerStatus === "open"));
  }, [drawerStatus, dispatch]);

  return (
    <PlatformPressable
      accessible
      accessibilityRole="button"
      android_ripple={{ borderless: true }}
      onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
      style={{
        marginHorizontal: 11,
      }}
      hitSlop={Platform.select({
        ios: undefined,
        default: { top: 16, right: 16, bottom: 16, left: 16 },
      })}
    >
      <ArrowLeft size={24} />
    </PlatformPressable>
  );
};
