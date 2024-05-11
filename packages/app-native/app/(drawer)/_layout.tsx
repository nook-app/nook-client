import { Drawer } from "expo-router/drawer";

export default function Layout() {
  return (
    <Drawer
      screenOptions={() => {
        return {
          headerShown: false,
          swipeEnabled: false,
        };
      }}
    />
  );
}
