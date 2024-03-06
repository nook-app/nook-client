import { View } from "tamagui";
import {
  DrawerContentScrollView,
  createDrawerNavigator,
} from "@react-navigation/drawer";
import { XStack } from "tamagui";
import { NookNavigator } from "./NookNavigator";
import { NooksSelector } from "../nooks/NooksSelector";
import { ActiveNook } from "../nooks/ActiveNook";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";

const Drawer = createDrawerNavigator();

export const NooksNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={({ route }) => {
        const focusedRoute = getFocusedRouteNameFromRoute(route);
        return {
          headerShown: false,
          swipeEdgeWidth: 300,
          drawerStyle: {
            width: 300,
          },
          swipeEnabled: !focusedRoute || focusedRoute === "Nook",
        };
      }}
      drawerContent={(props) => (
        <XStack height="100%" flexDirection="row">
          <View
            style={{ width: 60 }}
            backgroundColor="$backgroundStrong"
            paddingHorizontal="$2"
          >
            <DrawerContentScrollView {...props}>
              <NooksSelector />
            </DrawerContentScrollView>
          </View>
          <View
            backgroundColor="$backgroundStrong"
            style={{ width: 240 }}
            paddingRight="$2"
          >
            <DrawerContentScrollView {...props}>
              <ActiveNook />
            </DrawerContentScrollView>
          </View>
        </XStack>
      )}
    >
      <Drawer.Screen name="NookDrawer" component={NookNavigator} />
    </Drawer.Navigator>
  );
};
