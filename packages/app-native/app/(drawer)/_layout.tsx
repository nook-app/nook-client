import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { usePathname } from "expo-router";

export default function Layout() {
  const pathname = usePathname();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={() => {
          return {
            headerShown: false,
            swipeEnabled: false,
          };
        }}
      />
    </GestureHandlerRootView>
  );
}
