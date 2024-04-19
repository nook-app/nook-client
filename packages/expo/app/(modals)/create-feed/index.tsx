import { Stack, router } from 'expo-router'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { Text, View, XStack, YStack } from 'tamagui'
import { Button } from '@/components/Button'
import { Image, Link, MessageSquare, MousePointerSquare } from '@tamagui/lucide-icons'
import { useDebouncedNavigate } from '@/hooks/useDebouncedNavigate'

export default function CreateFeedScreen() {
  const { navigate } = useDebouncedNavigate()
  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                router.back()
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <View>
                <Text>Cancel</Text>
              </View>
            </TouchableOpacity>
          ),
        }}
      />
      <YStack flex={1} backgroundColor="$color1" padding="$3" gap="$3">
        <Text fontWeight="600" fontSize="$7">
          What type of feed?
        </Text>
        <XStack gap="$3">
          <Button
            flex={1}
            height="$12"
            onPress={() =>
              navigate({
                pathname: '/(modals)/create-feed/[type]',
                params: { type: 'default' },
              })
            }
          >
            <YStack alignItems="center" gap="$2">
              <MessageSquare size={32} color="$color12" />
              <Text fontWeight="600" color="$color12" fontSize="$6">
                Casts
              </Text>
              <Text color="$mauve12">Newly created casts</Text>
            </YStack>
          </Button>
          <Button
            flex={1}
            height="$12"
            onPress={() =>
              navigate({
                pathname: '/(modals)/create-feed/[type]',
                params: { type: 'media' },
              })
            }
          >
            <YStack alignItems="center" gap="$2">
              <Image size={32} color="$color12" />
              <Text fontWeight="600" color="$color12" fontSize="$6">
                Media
              </Text>
              <Text color="$mauve12">Images and videos</Text>
            </YStack>
          </Button>
        </XStack>
        <XStack gap="$3">
          <Button
            flex={1}
            height="$12"
            onPress={() =>
              navigate({
                pathname: '/(modals)/create-feed/[type]',
                params: { type: 'frames' },
              })
            }
          >
            <YStack alignItems="center" gap="$2">
              <MousePointerSquare size={32} color="$color12" />
              <Text fontWeight="600" color="$color12" fontSize="$6">
                Frames
              </Text>
              <Text color="$mauve12">References frames</Text>
            </YStack>
          </Button>
          <Button
            flex={1}
            height="$12"
            onPress={() =>
              navigate({
                pathname: '/(modals)/create-feed/[type]',
                params: { type: 'embeds' },
              })
            }
          >
            <YStack alignItems="center" gap="$2">
              <Link size={32} color="$color12" />
              <Text fontWeight="600" color="$color12" fontSize="$6">
                Embeds
              </Text>
              <Text color="$mauve12">Referenced links</Text>
            </YStack>
          </Button>
        </XStack>
      </YStack>
    </>
  )
}
