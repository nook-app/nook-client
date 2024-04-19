import { SearchProvider } from '@/context/search'
import { Stack, useLocalSearchParams } from 'expo-router'
import { useTheme } from 'tamagui'

export default function SearchQueryLayout() {
  const theme = useTheme()
  const { query } = useLocalSearchParams()

  return (
    <SearchProvider initialQuery={query as string}>
      <Stack>
        <Stack.Screen
          name="index"
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
            headerShown: false,
            animation: 'fade',
            animationDuration: 200,
          }}
        />
        <Stack.Screen
          name="results"
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
            headerShown: false,
            animationDuration: 200,
          }}
        />
      </Stack>
    </SearchProvider>
  )
}
