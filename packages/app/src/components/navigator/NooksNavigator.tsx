import { useNooks } from "@/hooks/useNooks";
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
  const { nooks } = useNooks();
  return (
    <Drawer.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        swipeEdgeWidth: 200,
        drawerStyle: {
          width: 300,
        },
        swipeEnabled: getFocusedRouteNameFromRoute(route) === "Nook",
      })}
      drawerContent={(props) => (
        <XStack height="100%" flexDirection="row">
          <View
            style={{ width: 60 }}
            backgroundColor="$background"
            paddingHorizontal="$2"
          >
            <DrawerContentScrollView {...props}>
              <NooksSelector />
            </DrawerContentScrollView>
          </View>
          <View
            backgroundColor="$background"
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
