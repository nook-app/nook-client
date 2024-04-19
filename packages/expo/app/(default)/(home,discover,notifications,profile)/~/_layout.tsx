import { X } from '@tamagui/lucide-icons'
import { Stack, router } from 'expo-router'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { View, useTheme } from 'tamagui'

export default function Layout() {
  const theme = useTheme()
  return (
    <Stack>
      <Stack.Screen
        name="add-cast-action"
        options={{
          presentation: 'fullScreenModal',
          title: 'Add Cast Action',
          headerLeft: ({ canGoBack }) => (
            <TouchableOpacity
              onPress={() => (canGoBack ? router.back() : undefined)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View padding="$2">
                <X size={24} color="$mauve12" />
              </View>
            </TouchableOpacity>
          ),
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
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
