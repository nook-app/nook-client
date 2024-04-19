import { Stack } from 'expo-router'

export default function CreatePostLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationDuration: 200,
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  )
}
