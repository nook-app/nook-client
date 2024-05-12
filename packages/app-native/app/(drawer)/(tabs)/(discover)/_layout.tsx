import { Stack } from "expo-router";

export default function DiscoverLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="discover"
        options={{
          title: "Discover",
        }}
      />
    </Stack>
  );
}
