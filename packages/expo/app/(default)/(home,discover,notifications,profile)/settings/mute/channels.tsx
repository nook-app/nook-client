import { ArrowLeft, VolumeX } from '@tamagui/lucide-icons'
import { Stack, router } from 'expo-router'
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler'
import { Text, View, XStack, YStack } from 'tamagui'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { SheetType, useSheets } from '@/context/sheet'
import { Label } from '@/components/Label'
import { Channel } from '@/types'
import { useAuth } from '@/context/auth'
import { UserAvatar } from '@/components/UserAvatar'
import { useChannelByUrl } from '@/hooks/useChannel'
import { useChannelActions } from '@/hooks/useChannelActions'
import { DebouncedLink } from '@/components/DebouncedLink'
import { Button } from '@/components/Button'

export default function MuteChannelSettingsScreen() {
  const height = useBottomTabBarHeight()
  const { openSheet } = useSheets()
  const { user } = useAuth()
  const { muteChannel, unmuteChannel } = useChannelActions()

  const handleMuteChannel = async (channel?: Channel) => {
    if (!channel) return
    await muteChannel(channel)
  }

  const handleUnmuteChannel = async (channel?: Channel) => {
    if (!channel) return
    await unmuteChannel(channel)
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
          <Text color="$mauve11">
            Posts from muted channels won't show up across the app unless viewing the
            channel page. You can also mute channels directly from the page or posts.
          </Text>
        </View>
        <YStack padding="$3" gap="$3">
          <XStack justifyContent="space-between" alignItems="flex-end">
            <Label>Muted Channels</Label>
            <Button
              variant="primary"
              onPress={() =>
                openSheet(SheetType.ChannelSelector, {
                  limit: 100,
                  channels: [],
                  onSelectChannel: handleMuteChannel,
                  onUnselectChannel: handleUnmuteChannel,
                })
              }
            >
              Mute Channel
            </Button>
          </XStack>
          <View marginBottom="$15">
            <FlatList
              data={user?.mutedChannels}
              renderItem={({ item }) => (
                <MutedChannel key={item} url={item} onUnmute={handleUnmuteChannel} />
              )}
              ListEmptyComponent={<Text>No channels muted yet.</Text>}
            />
          </View>
        </YStack>
      </View>
    </>
  )
}

const MutedChannel = ({
  url,
  onUnmute,
}: { url: string; onUnmute: (channel: Channel) => void }) => {
  const { channel } = useChannelByUrl(url)

  if (!channel) return null

  return (
    <XStack justifyContent="space-between" alignItems="center" paddingVertical="$2.5">
      <DebouncedLink
        href={{
          pathname: '/channels/[channelId]',
          params: { channelId: channel.channelId },
        }}
      >
        <XStack gap="$2" alignItems="center">
          <UserAvatar pfp={channel.imageUrl} size="$3" useCdn={false} />
          <YStack gap="$1">
            <Text fontWeight="600" fontSize="$4" color="$mauve12">
              {channel.name}
            </Text>
            <XStack gap="$1.5">
              <Text color="$mauve11">{`/${channel.channelId}`}</Text>
            </XStack>
          </YStack>
        </XStack>
      </DebouncedLink>
      <TouchableOpacity
        onPress={() => onUnmute(channel)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <View padding="$2">
          <VolumeX size={20} color="$red9" />
        </View>
      </TouchableOpacity>
    </XStack>
  )
}
