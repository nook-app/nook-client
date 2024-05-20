import { useTheme } from "@nook/app-ui";
import { Stack } from "expo-router";
import { BackButton } from "../../../../components/IconButton";

export default function TransactionsLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.background.val,
        },
        headerShadowVisible: false,
        headerLeft: () => <BackButton />,
      }}
    >
      <Stack.Screen
        name="transactions"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="channels/[channelId]/index"
        getId={({ params }) => params?.channelId}
        options={{ title: "", headerBackVisible: false }}
      />
      <Stack.Screen
        name="channels/[channelId]/hosts"
        options={{ title: "Hosts" }}
        getId={({ params }) => params?.channelId}
      />
      <Stack.Screen
        name="users/[username]/index"
        getId={({ params }) => params?.username}
        options={{ title: "", headerBackVisible: false }}
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
        name="users/[username]/feed"
        options={{ title: "Feed" }}
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
      <Stack.Screen
        name="explore/actions"
        options={{ title: "Explore Actions" }}
      />
      <Stack.Screen name="lists/index" options={{ headerShown: false }} />
      <Stack.Screen name="lists/manage" options={{ title: "Lists" }} />
      <Stack.Screen
        name="lists/[listId]/index"
        options={{ title: "", headerBackVisible: false }}
        getId={({ params }) => params?.listId}
      />
      <Stack.Screen
        name="lists/[listId]/items"
        options={{ title: "List" }}
        getId={({ params }) => params?.listId}
      />
      <Stack.Screen
        name="lists/[listId]/settings/index"
        options={{ title: "Edit List" }}
      />
      <Stack.Screen
        name="lists/[listId]/settings/items"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="lists/[listId]/settings/display"
        options={{ title: "Edit Display Mode" }}
      />
    </Stack>
  );
}
