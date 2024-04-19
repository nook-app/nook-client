import { ArrowLeft } from '@tamagui/lucide-icons'
import { Stack, router } from 'expo-router'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler'
import { Text, View, XStack, YStack } from 'tamagui'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { Label } from '@/components/Label'
import { useAuth } from '@/context/auth'

export default function NotificationSubscriptionsScreen() {
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
            You will receive a notification any time a new cast is made in one of these
            feeds. You can subscribe directly from feed pages.
          </Text>
        </View>
        <YStack padding="$3" gap="$3">
          <XStack justifyContent="space-between" alignItems="flex-end">
            <Label>Subscriptions</Label>
          </XStack>
          <View marginBottom="$15">
            <FlatList
              data={user?.mutedChannels}
              renderItem={() => <></>}
              ListEmptyComponent={<Text>No subscriptions yet.</Text>}
            />
          </View>
        </YStack>
      </View>
    </>
  )
}
