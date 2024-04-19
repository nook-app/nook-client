import { Stack } from 'expo-router'
import { useTheme } from 'tamagui'

export default function SettingsLayout() {
  const theme = useTheme()

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: 'Settings',
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
        name="notifications/index"
        options={{
          title: 'Notification Settings',
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
        name="notifications/subscriptions"
        options={{
          title: 'Subscriptions',
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
        name="mute/index"
        options={{
          title: 'Mute Settings',
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
        name="mute/users"
        options={{
          title: 'Muted Users',
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
        name="mute/channels"
        options={{
          title: 'Muted Channels',
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
        name="mute/words"
        options={{
          title: 'Muted Words',
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
