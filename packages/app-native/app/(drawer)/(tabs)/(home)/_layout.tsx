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
      <Stack.Screen
        name="channels/[channelId]/index"
        getId={({ params }) => params?.channelId}
      />
      <Stack.Screen
        name="users/[username]/index"
        getId={({ params }) => params?.username}
      />
      <Stack.Screen
        name="users/[username]/followers"
        options={{ headerShown: false }}
        getId={({ params }) => params?.username}
      />
      <Stack.Screen
        name="users/[username]/following"
        options={{ headerShown: false }}
        getId={({ params }) => params?.username}
      />
      <Stack.Screen
        name="users/[username]/mutuals"
        options={{ headerShown: false }}
        getId={({ params }) => params?.username}
      />
      <Stack.Screen
        name="casts/[hash]/index"
        options={{ title: "Cast" }}
        getId={({ params }) => params?.hash}
      />
      <Stack.Screen
        name="casts/[hash]/likes"
        options={{ title: "Liked by" }}
        getId={({ params }) => params?.hash}
      />
      <Stack.Screen
        name="casts/[hash]/recasts"
        options={{ title: "Recasted by" }}
        getId={({ params }) => params?.hash}
      />
      <Stack.Screen
        name="casts/[hash]/quotes"
        options={{ title: "Quoted by" }}
        getId={({ params }) => params?.hash}
      />
    </Stack>
  );
}
