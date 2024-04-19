import { ArrowLeft } from '@tamagui/lucide-icons'
import { Stack, router } from 'expo-router'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { View, useTheme } from 'tamagui'

export default function SettingsLayout() {
  const theme = useTheme()

  return (
    <Stack
      screenOptions={{
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => {
              router.back()
            }}
          >
            <View hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ArrowLeft size={24} color="$mauve12" />
            </View>
          </TouchableOpacity>
        ),
      }}
    >
      <Stack.Screen
        name="index"
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
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add-word"
        options={{
          title: 'Add muted word',
          fullScreenGestureEnabled: true,
          gestureEnabled: true,
          headerBackTitleVisible: false,
          headerTintColor: theme.mauve12.val,
          headerStyle: {
            backgroundColor: theme.color1.val,
          },
          headerShadowVisible: false,
          presentation: 'modal',
        }}
      />
    </Stack>
  )
}
