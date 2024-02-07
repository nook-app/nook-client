import { Stack } from "expo-router";

import { View } from "tamagui";
import { useAppSelector } from "@hooks/useAppSelector";
import { DrawerToggleButton } from "@components/drawer-toggle";

export default function NookLayout() {
  const activeNook = useAppSelector((state) => state.user.activeNook);
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerLeft: () => <DrawerToggleButton />,
          headerBackground: () => (
            <View
              backgroundColor="$background"
              theme={activeNook.theme}
              height="100%"
            />
          ),
          headerTitle: activeNook.name,
          animation: "none",
        }}
      />
      <Stack.Screen
        name="content/[contentId]"
        options={{
          headerBackTitleVisible: false,
          headerTintColor: "white",
          headerBackground: () => (
            <View
              backgroundColor="$background"
              theme={activeNook.theme}
              height="100%"
            />
          ),
          headerTitle: "Post",
        }}
      />
    </Stack>
  );
}
