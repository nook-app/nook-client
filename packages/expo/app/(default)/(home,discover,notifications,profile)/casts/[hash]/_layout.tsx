import { IconButton } from '@/components/IconButton'
import { ArrowLeft } from '@tamagui/lucide-icons'
import { Stack, router } from 'expo-router'
import { useTheme } from 'tamagui'

export default function Layout() {
  const theme = useTheme()
  return (
    <Stack
      screenOptions={{
        headerLeft: () => (
          <IconButton onPress={() => router.back()}>
            <ArrowLeft size={16} color="white" />
          </IconButton>
        ),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Post',
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
        name="likes"
        options={{
          title: 'Likes',
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
        name="quotes"
        options={{
          title: 'Quotes',
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
        name="recasts"
        options={{
          title: 'Recasts',
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
