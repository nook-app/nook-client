import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

export default function Layout() {
  const theme = useTheme()
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerShadowVisible: false,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerBackVisible: false,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="followers"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          animationDuration: 200,
        }}
      />
      <Stack.Screen
        name="following"
        options={{
          title: '',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          animationDuration: 200,
        }}
      />
    </Stack>
  )
}
