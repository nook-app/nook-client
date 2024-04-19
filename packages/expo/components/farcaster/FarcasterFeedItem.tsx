import { memo, useState } from 'react'
import { Text, View, YStack, Image as TImage, XStack } from 'tamagui'
import { FarcasterCast as FarcasterCastType, PanelDisplay } from '@/types'
import { formatToWarpcastCDN } from '@/utils'
import { FarcasterCastHeader } from './FarcasterCast'
import { EmbedFrame } from '../embeds/EmbedFrame'
import { Image } from 'expo-image'
import { FarcasterCastText } from './FarcasterCastText'
import { FarcasterCast } from './FarcasterCast'
import { FarcasterCastActionBar } from './FarcasterCastActions'
import { UserAvatar } from '../UserAvatar'
import { DebouncedLink } from '../DebouncedLink'
import { EmbedVideo } from '../embeds/EmbedVideo'

export const FarcasterFeedItem = memo(
  ({
    cast,
    display,
  }: {
    cast: FarcasterCastType
    display?: PanelDisplay
  }) => {
    switch (display) {
      case PanelDisplay.MEDIA:
        return <FarcasterCastMedia cast={cast} />
      case PanelDisplay.FRAMES:
        return <FarcasterCastFrame cast={cast} />
      case PanelDisplay.GRID:
        return <FarcasterCastGrid cast={cast} />
      case PanelDisplay.REPLIES:
        return (
          <View borderBottomWidth="$0.25" borderBottomColor="$color4" padding="$3">
            <FarcasterCast cast={cast} disableParent hideSeparator isReply />
          </View>
        )
      default:
        return (
          <View borderBottomWidth="$0.25" borderBottomColor="$color4" padding="$3">
            <FarcasterCast cast={cast} hideSeparator />
          </View>
        )
    }
  }
)

export const FarcasterCastMedia = ({ cast }: { cast: FarcasterCastType }) => {
  const [height, setHeight] = useState(0)
  const imageEmbed = cast.embeds.find((embed) => embed.type?.startsWith('image'))
  const videoEmbed = cast.embeds.find((embed) =>
    embed.type?.startsWith('application/x-mpegURL')
  )

  return (
    <DebouncedLink
      href={{
        pathname: `/casts/[hash]`,
        params: { hash: cast.hash },
      }}
      asChild
    >
      <YStack
        gap="$2.5"
        borderBottomWidth="$0.25"
        borderBottomColor="$color4"
        paddingVertical="$2"
      >
        <XStack paddingHorizontal="$2" gap="$2" alignItems="center">
          <DebouncedLink
            asChild
            href={{
              pathname: `/users/[fid]`,
              params: { fid: cast.user.fid },
            }}
          >
            <View>
              <UserAvatar pfp={cast.user.pfp} size="$3" />
            </View>
          </DebouncedLink>
          <View flex={1}>
            <FarcasterCastHeader cast={cast} />
          </View>
        </XStack>
        {imageEmbed && (
          <View
            width="100%"
            height={height}
            onLayout={({ nativeEvent }) => {
              TImage.getSize(formatToWarpcastCDN(imageEmbed.uri), (w, h) => {
                if (w > 0) {
                  setHeight((h / w) * nativeEvent.layout.width)
                }
              })
            }}
          >
            <Image
              source={{ uri: formatToWarpcastCDN(imageEmbed.uri) }}
              style={{ height: '100%', width: '100%' }}
            />
          </View>
        )}
        {videoEmbed && <EmbedVideo content={videoEmbed} noBorderRadius />}
        <YStack paddingHorizontal="$2.5" gap="$2">
          <Text numberOfLines={4}>
            <Text fontWeight="600" color="$mauve12">
              {cast.user.username || `!${cast.user.fid}`}{' '}
            </Text>
            {(cast.text || cast.mentions.length > 0) && <FarcasterCastText cast={cast} />}
          </Text>
          <FarcasterCastActionBar hash={cast.hash} />
        </YStack>
      </YStack>
    </DebouncedLink>
  )
}

export const FarcasterCastFrame = ({ cast }: { cast: FarcasterCastType }) => {
  const frameEmbed = cast.embeds.find((embed) => embed.frame)
  if (!frameEmbed) return null
  return (
    <DebouncedLink
      href={{
        pathname: `/casts/[hash]`,
        params: { hash: cast.hash },
      }}
      asChild
    >
      <YStack
        gap="$2.5"
        borderBottomWidth="$0.25"
        borderBottomColor="$color4"
        padding="$3"
      >
        <XStack gap="$2" alignItems="center">
          <DebouncedLink
            asChild
            href={{
              pathname: `/users/[fid]`,
              params: { fid: cast.user.fid },
            }}
          >
            <View>
              <UserAvatar pfp={cast.user.pfp} size="$3" />
            </View>
          </DebouncedLink>
          <View flex={1}>
            <FarcasterCastHeader cast={cast} />
          </View>
        </XStack>
        <YStack gap="$2">
          <Text>
            {(cast.text || cast.mentions.length > 0) && <FarcasterCastText cast={cast} />}
          </Text>
          <EmbedFrame cast={cast} content={frameEmbed} />
          <FarcasterCastActionBar hash={cast.hash} />
        </YStack>
      </YStack>
    </DebouncedLink>
  )
}

export const FarcasterCastGrid = ({ cast }: { cast: FarcasterCastType }) => {
  const imageEmbed = cast.embeds.find((embed) => embed.type?.startsWith('image'))
  if (!imageEmbed) return null
  return (
    <DebouncedLink
      href={{
        pathname: `/casts/[hash]`,
        params: { hash: cast.hash },
      }}
      asChild
    >
      <YStack
        width="100%"
        aspectRatio={1}
        borderRightWidth="$0.5"
        borderBottomWidth="$0.5"
        borderColor="$color4"
      >
        <Image
          source={{ uri: formatToWarpcastCDN(imageEmbed.uri) }}
          style={{ height: '100%', width: '100%' }}
        />
      </YStack>
    </DebouncedLink>
  )
}
