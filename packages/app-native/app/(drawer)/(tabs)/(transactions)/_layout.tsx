import { Stack } from "expo-router";

export default function TransactionsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="transactions"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
