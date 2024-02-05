import { Stack } from "expo-router";
import { View } from "tamagui";

export default function NotificationsLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackground: () => (
          <View backgroundColor="$background" theme="pink" height="100%" />
        ),
        headerTitle: "Notifications",
      }}
    />
  );
}
