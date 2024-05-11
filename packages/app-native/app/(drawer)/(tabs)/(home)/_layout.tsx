import { Stack, router } from "expo-router";
import { useTheme } from "@nook/app-ui";
import { IconButton } from "../../../../components/IconButton";
import { ArrowLeft } from "@tamagui/lucide-icons";

export default function HomeLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background.val,
        },
        headerShadowVisible: false,
        headerLeft: () => <IconButton icon={ArrowLeft} onPress={router.back} />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="channels/[channelId]/index" />
      <Stack.Screen name="users/[username]/index" />
      <Stack.Screen
        name="users/[username]/followers"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="users/[username]/following"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="users/[username]/mutuals"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="casts/[hash]/index" options={{ title: "Cast" }} />
      <Stack.Screen name="casts/[hash]/likes" options={{ title: "Liked by" }} />
      <Stack.Screen
        name="casts/[hash]/recasts"
        options={{ title: "Recasted by" }}
      />
      <Stack.Screen
        name="casts/[hash]/quotes"
        options={{ title: "Quoted by" }}
      />
    </Stack>
  );
}
