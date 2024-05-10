import { Stack, router } from "expo-router";
import { useTheme } from "@nook/app-ui";
import { IconButton } from "../../../../components/IconButton";
import { ArrowLeft } from "@tamagui/lucide-icons";

export default function HomeLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerLeft: () => <IconButton icon={ArrowLeft} onPress={router.back} />,
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
      <Stack.Screen
        name="users/[username]/index"
        options={{
          title: "User",
        }}
      />
      <Stack.Screen
        name="casts/[hash]/index"
        options={{
          title: "Cast",
        }}
      />
    </Stack>
  );
}
