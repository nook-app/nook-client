import { UrlContentResponse } from '@/types'
import { formatToWarpcastCDN } from '@/utils'
import { Feather } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { Linking } from 'react-native'
import { TapGestureHandler } from 'react-native-gesture-handler'
import { Text, View, XStack, YStack, useTheme } from 'tamagui'

export const EmbedUrl = ({ content }: { content: UrlContentResponse }) => {
  const theme = useTheme()
  if (!content.metadata) return null

  if (!content.metadata.image) {
    return <EmbedUrlSmall content={content} />
  }

  return (
    <TapGestureHandler>
      <YStack
        borderRadius="$4"
        borderColor="$borderColor"
        borderWidth="$0.25"
        overflow="hidden"
        onPress={() => Linking.openURL(content.uri)}
      >
        {content.metadata.image && (
          <View flex={1}>
            <View
              position="absolute"
              top={0}
              right={0}
              bottom={0}
              left={0}
              alignItems="center"
              justifyContent="center"
            >
              <Feather name="link" size={48} color={theme.mauve12.val} />
            </View>
            <Image
              source={{ uri: formatToWarpcastCDN(content.metadata.image) }}
              style={{
                width: '100%',
                height: '100%',
                aspectRatio: 1.91,
              }}
            />
          </View>
        )}
        <YStack
          gap="$1.5"
          padding="$2"
          borderColor="$borderColor"
          borderTopWidth="$0.25"
          backgroundColor="$color2"
        >
          <Text numberOfLines={1} fontSize="$2">
            {content.host}
          </Text>
          <Text fontWeight="600" numberOfLines={1}>
            {content.metadata.title}
          </Text>
          <Text numberOfLines={2}>{content.metadata.description}</Text>
        </YStack>
      </YStack>
    </TapGestureHandler>
  )
}

const EmbedUrlSmall = ({ content }: { content: UrlContentResponse }) => {
  const theme = useTheme()
  if (!content.metadata) return null

  return (
    <TapGestureHandler>
      <XStack
        alignItems="center"
        borderColor="$borderColor"
        borderWidth="$0.25"
        borderRadius="$4"
        overflow="hidden"
        onPress={() => Linking.openURL(content.uri)}
      >
        <View padding="$4" backgroundColor="$color3">
          <Feather name="link" size={24} color={theme.mauve12.val} />
        </View>
        <YStack gap="$1" paddingHorizontal="$3" flexShrink={1}>
          <Text fontSize="$3" numberOfLines={1}>
            {content.host}
          </Text>
          {content.metadata.title && (
            <Text fontWeight="600" fontSize="$3" numberOfLines={1} ellipsizeMode="tail">
              {content.metadata.title}
            </Text>
          )}
        </YStack>
      </XStack>
    </TapGestureHandler>
  )
}
