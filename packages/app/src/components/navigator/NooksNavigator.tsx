import {
  DrawerContentScrollView,
  createDrawerNavigator,
} from "@react-navigation/drawer";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { XStack, YStack } from "tamagui";
import { NookNavigator } from "./NookNavigator";
import { NooksSelector } from "../nooks/NooksSelector";
import { ActiveNook } from "../nooks/ActiveNook";

const Drawer = createDrawerNavigator();

export function NooksNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={({ route }) => {
        return {
          swipeEnabled: getFocusedRouteNameFromRoute(route) !== "Content",
          swipeEdgeWidth: 100,
          drawerStyle: {
            width: 300,
          },
        };
      }}
      drawerContent={(props) => (
        <XStack height="100%" style={{ width: 300 }}>
          <YStack style={{ width: 60 }} backgroundColor="$background">
            <DrawerContentScrollView {...props}>
              <NooksSelector />
            </DrawerContentScrollView>
          </YStack>
          <YStack backgroundColor="$background" style={{ width: 240 }}>
            <DrawerContentScrollView {...props}>
              <ActiveNook />
            </DrawerContentScrollView>
          </YStack>
        </XStack>
      )}
    >
      <Drawer.Screen
        name="Nook"
        component={NookNavigator}
        options={{ headerShown: false }}
      />
    </Drawer.Navigator>
  );
}
