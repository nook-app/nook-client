import { Stack } from "expo-router";
import { useTheme } from "tamagui";

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: "transparentModal",
        contentStyle: { backgroundColor: "rgba(0, 0, 0, 0.90)" },
      }}
    >
      <Stack.Screen name="image/[url]" />
    </Stack>
  );
}
