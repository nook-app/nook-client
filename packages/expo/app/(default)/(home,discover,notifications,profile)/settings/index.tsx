import { ArrowLeft, Bell, ChevronRight, VolumeX } from '@tamagui/lucide-icons'
import { Stack, router } from 'expo-router'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { Text, View, XStack, YStack } from 'tamagui'
import * as Application from 'expo-application'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { DebouncedLink } from '@/components/DebouncedLink'

export default function SettingsScreen() {
  const height = useBottomTabBarHeight()
  return (
    <>
      <Stack.Screen
        options={{
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
      />
      <View
        flex={1}
        backgroundColor="$color1"
        justifyContent="space-between"
        paddingBottom={height}
      >
        <YStack gap="$6" paddingTop="$4">
          <DebouncedLink
            href={{
              pathname: '/settings/mute',
            }}
          >
            <XStack alignItems="center">
              <View padding="$3">
                <VolumeX size={20} color="$mauve11" />
              </View>
              <YStack flex={1} gap="$1">
                <Text color="$mauve12" fontWeight="600">
                  Mute
                </Text>
                <Text color="$mauve11">
                  Manage the accounts, channels, and words that you've muted.
                </Text>
              </YStack>
              <View padding="$2">
                <ChevronRight size={24} color="$mauve12" />
              </View>
            </XStack>
          </DebouncedLink>
          <DebouncedLink
            href={{
              pathname: '/settings/notifications',
            }}
          >
            <XStack alignItems="center">
              <View padding="$3">
                <Bell size={20} color="$mauve11" />
              </View>
              <YStack flex={1} gap="$1">
                <Text color="$mauve12" fontWeight="600">
                  Notifications
                </Text>
                <Text color="$mauve11">
                  Manage the kinds of notifications you receive from Nook.
                </Text>
              </YStack>
              <View padding="$2">
                <ChevronRight size={24} color="$mauve12" />
              </View>
            </XStack>
          </DebouncedLink>
        </YStack>
        <XStack padding="$2" gap="$2">
          <Text color="$mauve11">{`Version: v${Application.nativeApplicationVersion}`}</Text>
          <Text color="$mauve11">{`Build: ${Application.nativeBuildVersion}`}</Text>
        </XStack>
      </View>
    </>
  )
}
