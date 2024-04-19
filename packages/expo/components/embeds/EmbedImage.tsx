import { Image } from 'expo-image'
import { useState } from 'react'
import { View, XStack, Image as TImage } from 'tamagui'
import { DebouncedLink } from '../DebouncedLink'

export const EmbedImages = ({ uris }: { uris: string[] }) => {
  if (uris.length === 1) {
    return <EmbedImage uri={uris[0]} />
  }

  return (
    <XStack borderRadius="$4" overflow="hidden" gap="$2">
      {uris.map((uri, index) => (
        <DebouncedLink
          key={index}
          asChild
          absolute
          href={{
            pathname: '/image/[url]',
            params: { beforeUrl: uris[index - 1], url: uri, afterUrl: uris[index + 1] },
          }}
        >
          <View
            key={index}
            borderRadius="$4"
            overflow="hidden"
            width="50%"
            maxHeight={200}
          >
            <Image
              recyclingKey={uri}
              source={{ uri }}
              style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
            />
          </View>
        </DebouncedLink>
      ))}
    </XStack>
  )
}

export const EmbedImage = ({ uri }: { uri: string }) => {
  const [height, setHeight] = useState(0)

  return (
    <DebouncedLink
      href={{
        pathname: '/image/[url]',
        params: { url: uri },
      }}
      absolute
      asChild
    >
      <View
        borderRadius={'$4'}
        overflow="hidden"
        maxHeight={600}
        onLayout={({ nativeEvent }) => {
          TImage.getSize(uri, (w, h) => {
            if (w > 0) {
              setHeight((h / w) * nativeEvent.layout.width)
            }
          })
        }}
      >
        <Image
          recyclingKey={uri}
          source={{ uri }}
          style={{
            width: '100%',
            height,
          }}
        />
      </View>
    </DebouncedLink>
  )
}
