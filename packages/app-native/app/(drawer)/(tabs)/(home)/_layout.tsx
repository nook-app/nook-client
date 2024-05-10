import { Stack } from "expo-router";
import { useTheme } from "@nook/app-ui";

export default function HomeLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background.val,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="channels/[channelId]/index"
        options={{
          title: "Channel",
        }}
      />
      <Stack.Screen name="users/[username]/index" options={{}} />
      <Stack.Screen
        name="casts/[hash]/index"
        options={{
          title: "Cast",
        }}
      />
    </Stack>
  );
}
