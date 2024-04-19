import { ArrowLeft, ChevronRight } from '@tamagui/lucide-icons'
import { Stack, router } from 'expo-router'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { Switch, Text, View, XStack, YStack } from 'tamagui'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useNotifications } from '@/context/notifications'
import { updateNotificationPreferences } from '@/utils/api'
import { useQueryClient } from '@tanstack/react-query'
import { NotificationPreferences } from '@/types'
import { useAuth } from '@/context/auth'
import { haptics } from '@/utils/haptics'
import { DebouncedLink } from '@/components/DebouncedLink'

export default function NotificationSettingsScreen() {
  const height = useBottomTabBarHeight()
  const { session } = useAuth()
  const { preferences, registerForPushNotificationsAsync } = useNotifications()
  const queryClient = useQueryClient()

  const toggleNotifications = async () => {
    if (preferences?.disabled) {
      await registerForPushNotificationsAsync()
      return
    }

    const data = {
      disabled: false,
      onlyPowerBadge: true,
      receive: !preferences?.receive,
      subscriptions: [],
    }

    await updateNotificationPreferences(data)
    queryClient.setQueryData<NotificationPreferences>(
      ['notificationsPreferences', session?.fid],
      (prev) => {
        if (!prev) return
        return {
          ...prev,
          disabled: data.disabled,
          onlyPowerBadge: data.onlyPowerBadge,
          receive: data.receive,
        }
      }
    )
    haptics.notificationSuccess()
  }

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
          <Text color="$mauve11">Manage the notifications you receive from Nook.</Text>
        </View>
        <YStack gap="$6" paddingTop="$4" paddingHorizontal="$2">
          <XStack gap="$4" justifyContent="space-between">
            <YStack flex={1}>
              <Text color="$mauve12" fontWeight="600">
                Receive Notifications
              </Text>
              <Text color="$mauve11">
                Nook will only send you notifications from users you follow or users with
                a power badge.
              </Text>
            </YStack>
            <Switch
              defaultChecked={preferences?.receive}
              onCheckedChange={toggleNotifications}
            >
              <Switch.Thumb backgroundColor="white" />
            </Switch>
          </XStack>
          <DebouncedLink
            href={{
              pathname: `/settings/notifications/subscriptions`,
            }}
          >
            <XStack alignItems="center">
              <YStack flex={1} gap="$1">
                <Text color="$mauve12" fontWeight="600">
                  Subscriptions
                </Text>
                <Text color="$mauve11">Manage your feed subscriptions.</Text>
              </YStack>
              <View padding="$2">
                <ChevronRight size={24} color="$mauve12" />
              </View>
            </XStack>
          </DebouncedLink>
        </YStack>
      </View>
    </>
  )
}
