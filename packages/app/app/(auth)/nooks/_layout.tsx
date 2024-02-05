import { Redirect, useNavigation } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";

import { useAuth } from "../../../context/auth";
import { Image, Text, View, getToken } from "tamagui";
import { PlatformPressable } from "@react-navigation/elements";
import { DrawerActions, ParamListBase } from "@react-navigation/native";
import { Platform } from "react-native";
import {
  DrawerContentScrollView,
  DrawerNavigationProp,
  useDrawerStatus,
} from "@react-navigation/drawer";
import { useEffect } from "react";
import { useAppDispatch } from "../../../hooks/useAppDispatch";
import { setDrawerOpen } from "../../../store/drawer";
import { ArrowLeft } from "@tamagui/lucide-icons";

export default function AuthedLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        // screenOptions={{
        //   drawerStyle: {
        //     width: getToken("$20"),
        //   },
        // }}
        drawerContent={(props) => (
          <View backgroundColor="$background" theme="pink" height="100%">
            <DrawerContentScrollView {...props}>
              <Text>Hello</Text>
            </DrawerContentScrollView>
          </View>
        )}
      >
        <Drawer.Screen
          name="index"
          options={{
            headerLeft: () => <DrawerToggleButton />,
            headerBackground: () => (
              <View backgroundColor="$background" theme="pink" height="100%" />
            ),
            headerTitle: "Home",
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const DrawerToggleButton = ({ src }: { src?: string }) => {
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
