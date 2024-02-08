import SlotsScreen from "@/screens/SlotsScreen";
import { createDrawerNavigator } from "@react-navigation/drawer";

import { PlatformPressable } from "@react-navigation/elements";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";
import { useDrawerStatus } from "@react-navigation/drawer";
import { useEffect } from "react";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { useAppDispatch } from "@/hooks/useAppDispatch";
import { setDrawerOpen } from "@/store/drawer";
import { View } from "tamagui";
import { useAppSelector } from "@/hooks/useAppSelector";
import { TEMPLATE_NOOKS } from "@/constants/nooks";

const Drawer = createDrawerNavigator();

const DrawerToggleButton = () => {
  const navigation = useNavigation();
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

export function NooksNavigator() {
  return (
    <Drawer.Navigator>
      {TEMPLATE_NOOKS.map((nook) => (
        <Drawer.Screen
          key={nook.id}
          name={nook.name}
          component={SlotsScreen}
          initialParams={{
            nookId: nook.id,
          }}
          options={{
            headerLeft: () => <DrawerToggleButton />,
            headerBackground: () => (
              <View
                backgroundColor="$background"
                theme={nook.theme}
                height="100%"
              />
            ),
            headerTitle: nook.name,
          }}
        />
      ))}
    </Drawer.Navigator>
  );
}
