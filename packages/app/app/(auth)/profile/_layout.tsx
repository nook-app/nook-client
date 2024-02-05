import { Stack } from "expo-router";
import { View } from "tamagui";

export default function ProfileLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackground: () => (
          <View backgroundColor="$background" theme="pink" height="100%" />
        ),
        headerTitle: "Profile",
      }}
    />
  );
}
