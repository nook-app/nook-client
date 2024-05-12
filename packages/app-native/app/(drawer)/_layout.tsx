import { Drawer } from "expo-router/drawer";
import { SidebarLayout } from "../../components/SidebarLayout";

export default function Layout() {
  return (
    <Drawer
      drawerContent={() => <SidebarLayout />}
      screenOptions={() => {
        return {
          headerShown: false,
          swipeEnabled: false,
        };
      }}
    />
  );
}
