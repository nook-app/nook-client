import { Drawer } from "expo-router/drawer";
import { SidebarLayout } from "../../components/SidebarLayout";

export default function Layout() {
  return (
    <Drawer
      drawerContent={() => <SidebarLayout />}
      screenOptions={({ navigation }) => {
        const state = navigation.getState();
        const drawerRoute = state.routes[state.index];
        const tabRoute = drawerRoute.state?.routes[drawerRoute.state.index];
        const isRoot = tabRoute?.state?.index === 0;
        return {
          headerShown: false,
          swipeEnabled: isRoot,
        };
      }}
    />
  );
}
