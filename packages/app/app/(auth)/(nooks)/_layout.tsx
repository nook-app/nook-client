import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";

import { Text, View } from "tamagui";
import { DrawerContentScrollView } from "@react-navigation/drawer";
export default function DrawerLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        drawerContent={(props) => (
          <View backgroundColor="$background" theme="pink" height="100%">
            <DrawerContentScrollView {...props}>
              <Text>Hello</Text>
            </DrawerContentScrollView>
          </View>
        )}
        screenOptions={{ headerShown: false }}
      >
        <Drawer.Screen name="nooks" />
      </Drawer>
    </GestureHandlerRootView>
  );
}
