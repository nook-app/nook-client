import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

export default function FeedLayout() {
  const theme = useTheme()
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: '',
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="[type]"
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
        }}
      />
    </Stack>
  )
}
