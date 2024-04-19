import { UserAvatar } from '@/components/UserAvatar'
import { useUser } from '@/hooks/useUser'
import { Channel } from '@/types'
import { formatNumber } from '@/utils'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { Text, View, XStack, YStack } from 'tamagui'
import { useState } from 'react'
import { Label } from '@/components/Label'
import { FarcasterBioText } from '@/components/farcaster/FarcasterBioText'
import { DebouncedLink } from '@/components/DebouncedLink'

export const ChannelHeader = ({ channel }: { channel: Channel }) => {
  const [showAll, setShowAll] = useState(false)

  return (
    <YStack gap="$3" backgroundColor="$background" padding="$3">
      <XStack gap="$3" alignItems="center">
        <UserAvatar pfp={channel.imageUrl} size="$4" useCdn={false} />
        <YStack gap="$1.5" flex={1}>
          <Text numberOfLines={1}>
            <Text fontWeight="700" fontSize="$5" color="$mauve12">
              {channel.name}
            </Text>
            <Text fontSize="$4" color="$mauve11">{` /${channel.channelId}`}</Text>
          </Text>
          <XStack gap="$2">
            <View flexDirection="row" alignItems="center" gap="$1">
              <Text fontWeight="600" color="$mauve12">
                {formatNumber(channel.followerCount || 0)}
              </Text>
              <Text color="$mauve11">followers</Text>
            </View>
          </XStack>
        </YStack>
      </XStack>
      {channel.description && (
        <Text numberOfLines={showAll ? 0 : 2}>
          <FarcasterBioText text={channel.description} />
        </Text>
      )}
      {showAll && channel.hostFids && (
        <YStack gap="$2">
          <Label>Hosts</Label>
          <XStack gap="$2" flexWrap="wrap">
            {channel.hostFids.map((fid, index) => (
              <ChannelHost fid={fid} key={index} />
            ))}
          </XStack>
        </YStack>
      )}
      <TouchableOpacity onPress={() => setShowAll(!showAll)}>
        <Text color="$color11" fontSize="$2" fontWeight="600">
          {showAll ? 'See less' : 'See more'}
        </Text>
      </TouchableOpacity>
    </YStack>
  )
}

const ChannelHost = ({ fid }: { fid: string }) => {
  const { user } = useUser(fid)
  if (!user) return null

  return (
    <DebouncedLink
      href={{
        pathname: '/users/[fid]',
        params: { fid },
      }}
    >
      <XStack gap="$1.5">
        <UserAvatar pfp={user?.pfp} size="$1" useCdn={false} />
        <Text color="$mauve11">{user?.username ? `@${user.username}` : `!${fid}`}</Text>
      </XStack>
    </DebouncedLink>
  )
}
