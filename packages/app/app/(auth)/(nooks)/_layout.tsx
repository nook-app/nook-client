import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { Text, View } from "tamagui";
import { DrawerContentScrollView } from "@react-navigation/drawer";

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{ headerShown: false }}
      drawerContent={() => (
        <View flexGrow={1} backgroundColor="$background" theme="pink">
          <DrawerContentScrollView>
            <Text>Hello</Text>
          </DrawerContentScrollView>
        </View>
      )}
    >
      <Drawer.Screen
        name="/nooks/[nookId]/feeds/[feedId]"
        initialParams={{
          nookId: "home",
          feedId: "new",
        }}
      />
    </Drawer>
  );
}
