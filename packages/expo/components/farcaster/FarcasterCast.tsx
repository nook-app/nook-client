import { Separator, Text, View, XStack, YStack, useTheme } from 'tamagui'
import { PowerBadge } from '../PowerBadge'
import { formatTimeAgo } from '@/utils'
import { FarcasterChannel } from './FarcasterChannel'
import { useAuth } from '@/context/auth'
import { SheetType, useSheets } from '@/context/sheet'
import { Feather } from '@expo/vector-icons'
import { FarcasterCastText } from './FarcasterCastText'
import { Embeds } from '../embeds/Embed'
import { EmbedCast } from '../embeds/EmbedCast'
import { FarcasterCast as FarcasterCastType } from '@/types'
import { FarcasterCastActionBar, FarcasterCastActionCounts } from './FarcasterCastActions'
import { UserAvatar } from '../UserAvatar'
import { DebouncedLink } from '../DebouncedLink'
import { EmbedMedia } from '../embeds/EmbedMedia'

export const FarcasterCast = ({
  cast,
  disableParent,
  hideSeparator,
  disableMenu,
  onlyMedia,
  disableLink,
  hideActionBar,
  isReply,
}: {
  cast: FarcasterCastType
  disableParent?: boolean
  hideSeparator?: boolean
  disableMenu?: boolean
  onlyMedia?: boolean
  disableLink?: boolean
  hideActionBar?: boolean
  isReply?: boolean
}) => {
  return (
    <YStack>
      {!disableParent && cast.parent && (
        <FarcasterCast cast={cast.parent} disableParent />
      )}
      {disableParent && cast.parentHash && !cast.parent && !isReply && (
        <DebouncedLink
          href={{
            pathname: `/casts/[hash]`,
            params: { hash: cast.parentHash },
          }}
          asChild
          disabled={disableLink}
        >
          <XStack height="$1">
            <YStack alignItems="center" width="$4">
              <Separator
                vertical
                borderWidth={!hideSeparator ? '$0.25' : '$0'}
                borderColor="$color5"
                borderStyle="dashed"
              />
            </YStack>
            <Text color="$mauve10" fontSize="$1" fontWeight="500">
              view thread
            </Text>
          </XStack>
        </DebouncedLink>
      )}
      <DebouncedLink
        href={{
          pathname: `/casts/[hash]`,
          params: { hash: cast.hash },
        }}
        asChild
        disabled={disableLink}
      >
        <XStack gap="$2" alignItems="flex-start">
          <YStack alignItems="center" width="$4" marginTop="$1">
            <DebouncedLink
              href={{
                pathname: `/users/[fid]`,
                params: { fid: cast.user.fid },
              }}
              asChild
              disabled={disableLink}
            >
              <View>
                <UserAvatar pfp={cast.user.pfp} size="$4" />
              </View>
            </DebouncedLink>
            <Separator
              vertical
              borderWidth={!hideSeparator ? '$0.25' : '$0'}
              borderColor="$color6"
              backgroundColor="$color6"
            />
          </YStack>
          <YStack flex={1} gap="$2" paddingBottom={!hideSeparator ? '$3' : '$0'}>
            <FarcasterCastHeader cast={cast} disableMenu={disableMenu} />
            {(cast.text || cast.mentions.length > 0) && <FarcasterCastText cast={cast} />}
            {cast.embeds.length > 0 && onlyMedia && <EmbedMedia cast={cast} />}
            {cast.embeds.length > 0 && !onlyMedia && <Embeds cast={cast} />}
            {cast.embedCasts.map((cast, index) => (
              <EmbedCast key={index} cast={cast} />
            ))}
            {!hideActionBar && <FarcasterCastActionBar hash={cast.hash} />}
            {!hideActionBar && <FarcasterCastActionCounts hash={cast.hash} />}
          </YStack>
        </XStack>
      </DebouncedLink>
    </YStack>
  )
}

export const FarcasterCastHeader = ({
  cast,
  disableMenu,
}: { cast: FarcasterCastType; disableMenu?: boolean }) => {
  return (
    <XStack justifyContent="space-between">
      <YStack gap="$1" flexShrink={1}>
        <DebouncedLink
          href={{
            pathname: `/users/[fid]`,
            params: { fid: cast.user.fid },
          }}
          asChild
        >
          <XStack gap="$1.5" alignItems="center" paddingRight="$2">
            <Text flexShrink={1} numberOfLines={1}>
              <Text fontWeight="600" color="$mauve12">
                {`${cast.user.displayName || cast.user.username || `!${cast.user.fid}`} `}
              </Text>
              <PowerBadge fid={cast.user.fid} />
              <Text fontWeight="500" color="$mauve11" flexWrap="wrap">
                {cast.user.username ? ` @${cast.user.username}` : ` !${cast.user.fid}`}
              </Text>
            </Text>
          </XStack>
        </DebouncedLink>
        <XStack alignItems="center" gap="$1.5">
          <Text color="$mauve11">{formatTimeAgo(cast.timestamp)}</Text>
          {cast.channel && (
            <>
              <Text color="$mauve11">in</Text>
              <FarcasterChannel channel={cast.channel} />
            </>
          )}
        </XStack>
      </YStack>
      {!disableMenu && <FarcasterCastKebabMenu hash={cast.hash} />}
    </XStack>
  )
}

const FarcasterCastKebabMenu = ({ hash }: { hash: string }) => {
  const { signer } = useAuth()
  const theme = useTheme()
  const { openSheet } = useSheets()

  return (
    <View
      onPress={() => {
        if (signer?.state === 'completed') {
          openSheet(SheetType.CastAction, { hash })
        } else {
          openSheet(SheetType.EnableSigner)
        }
      }}
      animation="bouncy"
      pressStyle={{ opacity: 0.25 }}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Feather name="more-horizontal" size={20} color={theme.mauve12.val} />
    </View>
  )
}
