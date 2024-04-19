import { ArrowLeft, ChevronRight } from '@tamagui/lucide-icons'
import { Stack, router } from 'expo-router'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { Text, View, XStack, YStack } from 'tamagui'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useAuth } from '@/context/auth'
import { DebouncedLink } from '@/components/DebouncedLink'

export default function MuteSettingsScreen() {
  const height = useBottomTabBarHeight()
  const { user } = useAuth()

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
      <View flex={1} backgroundColor="$color1" paddingBottom={height}>
        <View padding="$3">
          <Text color="$mauve11">
            Manage the accounts, channels, and words that you've muted.
          </Text>
        </View>
        <YStack>
          <DebouncedLink
            href={{
              pathname: '/settings/mute/users',
            }}
          >
            <XStack alignItems="center" paddingHorizontal="$3" paddingVertical="$2">
              <YStack flex={1} gap="$1">
                <Text color="$mauve12" fontWeight="600" fontSize="$5">
                  Muted Users
                </Text>
              </YStack>
              {user?.mutedUsers && user.mutedUsers.length > 0 && (
                <View paddingHorizontal="$2">
                  <Text color="$mauve11" fontSize="$5">
                    {user.mutedUsers.length}
                  </Text>
                </View>
              )}
              <ChevronRight size={24} color="$mauve12" />
            </XStack>
          </DebouncedLink>
          <DebouncedLink
            href={{
              pathname: '/settings/mute/channels',
            }}
          >
            <XStack alignItems="center" paddingHorizontal="$3" paddingVertical="$2">
              <YStack flex={1} gap="$1">
                <Text color="$mauve12" fontWeight="600" fontSize="$5">
                  Muted Channels
                </Text>
              </YStack>
              {user?.mutedChannels && user.mutedChannels.length > 0 && (
                <View paddingHorizontal="$2">
                  <Text color="$mauve11" fontSize="$5">
                    {user.mutedChannels.length}
                  </Text>
                </View>
              )}
              <ChevronRight size={24} color="$mauve12" />
            </XStack>
          </DebouncedLink>
          <DebouncedLink
            href={{
              pathname: '/settings/mute/words',
            }}
          >
            <XStack alignItems="center" paddingHorizontal="$3" paddingVertical="$2">
              <YStack flex={1} gap="$1">
                <Text color="$mauve12" fontWeight="600" fontSize="$5">
                  Muted Words
                </Text>
              </YStack>
              {user?.mutedWords && user.mutedWords.length > 0 && (
                <View paddingHorizontal="$2">
                  <Text color="$mauve11" fontSize="$5">
                    {user.mutedWords.length}
                  </Text>
                </View>
              )}
              <ChevronRight size={24} color="$mauve12" />
            </XStack>
          </DebouncedLink>
        </YStack>
      </View>
    </>
  )
}
