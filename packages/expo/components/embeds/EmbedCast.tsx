import { Text, View, XStack, YStack } from 'tamagui'
import { FarcasterCastText } from '../farcaster/FarcasterCastText'
import { FarcasterCast } from '@/types'
import { formatTimeAgo } from '@/utils'
import { FarcasterChannel } from '../farcaster/FarcasterChannel'
import { PowerBadge } from '../PowerBadge'
import { UserAvatar } from '../UserAvatar'
import { DebouncedLink } from '../DebouncedLink'
import { EmbedMedia } from './EmbedMedia'

export const EmbedCast = ({
  cast,
}: {
  cast: FarcasterCast
}) => {
  return (
    <DebouncedLink
      href={{
        pathname: `/casts/[hash]`,
        params: { hash: cast.hash },
      }}
      asChild
    >
      <YStack
        borderWidth="$0.25"
        borderColor="$borderColor"
        borderRadius="$4"
        padding="$2.5"
        gap="$2"
      >
        <XStack gap="$2" alignItems="center">
          <UserAvatar pfp={cast.user.pfp} size="$3" />
          <YStack flex={1} gap="$1">
            <XStack gap="$1.5" alignItems="center">
              <Text fontWeight="600" color="$mauve12">
                {cast.user.username || `!${cast.user.fid}`}
              </Text>
              <PowerBadge fid={cast.user.fid} />
            </XStack>
            <XStack alignItems="center" gap="$1.5" flexShrink={1}>
              <Text color="$mauve12">{formatTimeAgo(cast.timestamp)}</Text>
              {cast.channel && (
                <>
                  <Text color="$mauve12">in</Text>
                  <View flexShrink={1}>
                    <FarcasterChannel channel={cast.channel} />
                  </View>
                </>
              )}
            </XStack>
          </YStack>
        </XStack>
        {(cast.text || cast.mentions.length > 0) && (
          <FarcasterCastText cast={cast} disableLinks />
        )}
        {cast.embeds.length > 0 && <EmbedMedia cast={cast} />}
      </YStack>
    </DebouncedLink>
  )
}
