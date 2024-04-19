import { Text } from 'tamagui'
import { View, XStack } from 'tamagui'
import { Channel } from '@/types'
import { DebouncedLink } from '../DebouncedLink'
import { UserAvatar } from '../UserAvatar'

export const FarcasterChannel = ({ channel }: { channel: Channel }) => {
  return (
    <DebouncedLink
      href={{
        pathname: `/channels/[channelId]`,
        params: { channelId: channel.channelId },
      }}
      asChild
    >
      <XStack gap="$1.5" alignItems="center" flexShrink={1}>
        <UserAvatar pfp={channel.imageUrl} size="$1" />
        <View flexShrink={1}>
          <Text numberOfLines={1} ellipsizeMode="tail" fontWeight="500" color="$mauve12">
            {channel.name}
          </Text>
        </View>
      </XStack>
    </DebouncedLink>
  )
}
