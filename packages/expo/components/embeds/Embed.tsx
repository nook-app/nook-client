import { EmbedImage, EmbedImages } from './EmbedImage'
import { EmbedVideo } from './EmbedVideo'
import { EmbedUrl } from './EmbedUrl'
import { EmbedTwitter } from './EmbedTwitter'
import { Linking } from 'react-native'
import { Text, View, XStack, YStack, useTheme } from 'tamagui'
import { FarcasterCast, UrlContentResponse } from '@/types'
import { formatToWarpcastCDN } from '@/utils'
import { EmbedFrame } from './EmbedFrame'
import { TapGestureHandler } from 'react-native-gesture-handler'
import { Feather } from '@expo/vector-icons'
import { EmbedNook } from './EmbedNook'

export const Embed = ({
  content,
  cast,
}: {
  content: UrlContentResponse
  cast?: FarcasterCast
}) => {
  if (content.uri.startsWith('nook://') || content.uri.includes('nook.social')) {
    return <EmbedNook content={content} />
  }

  if (
    content.type?.startsWith('image/') ||
    (!content.type && content.uri.includes('imgur.com'))
  ) {
    return <EmbedImage uri={formatToWarpcastCDN(content.uri, { type: content.type })} />
  }
  if (
    content.type?.startsWith('video/') ||
    content.type?.startsWith('application/x-mpegURL')
  ) {
    return <EmbedVideo content={content} />
  }

  if (content.uri.includes('twitter.com') || content.uri.includes('x.com')) {
    return <EmbedTwitter content={content} />
  }

  if (content.metadata) {
    if (content.frame?.buttons && content.frame?.buttons.length > 0) {
      return <EmbedFrame cast={cast} content={content} />
    }
    return <EmbedUrl content={content} />
  }

  return <EmbedUrlNoContent uri={content.uri} />
}

export const Embeds = ({
  cast,
}: {
  cast: FarcasterCast
}) => {
  const isAllImages = cast.embeds.every(
    (embed) =>
      embed.type?.startsWith('image/') || (!embed.type && embed.uri.includes('imgur.com'))
  )
  if (isAllImages) {
    return (
      <EmbedImages
        uris={cast.embeds.map(({ uri, type }) => formatToWarpcastCDN(uri, { type }))}
      />
    )
  }

  return (
    <>
      {cast.embeds.map((content) => (
        <Embed key={content.uri} cast={cast} content={content} />
      ))}
    </>
  )
}

const EmbedUrlNoContent = ({ uri }: { uri: string }) => {
  const theme = useTheme()
  return (
    <XStack
      alignItems="center"
      borderColor="$borderColor"
      borderWidth="$0.25"
      borderRadius="$4"
      overflow="hidden"
      onPress={() => Linking.openURL(uri)}
    >
      <View padding="$4" backgroundColor="$color3">
        <Feather name="link" size={24} color={theme.color11.val} />
      </View>
      <YStack gap="$1" paddingHorizontal="$3" flexShrink={1}>
        <Text fontSize="$3" numberOfLines={1}>
          {uri}
        </Text>
      </YStack>
    </XStack>
  )
}
