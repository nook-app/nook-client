import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

export default function Layout() {
  const theme = useTheme()
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        presentation: 'transparentModal',
        contentStyle: { backgroundColor: 'rgba(0, 0, 0, 0.90)' },
      }}
    >
      <Stack.Screen name="[url]" />
    </Stack>
  )
}
