import { Image } from "expo-image";
import { useState } from "react";
import { View, XStack, Image as TImage } from "tamagui";
import { formatToCDN } from "../../utils";
import { Link } from "../link";

export const EmbedImages = ({ uris }: { uris: string[] }) => {
  if (uris.length === 1) {
    return <EmbedImage uri={uris[0]} />;
  }

  return (
    <XStack borderRadius="$4" overflow="hidden" gap="$2">
      {uris.map((uri, index) => (
        <Link
          key={uri}
          href={{
            pathname: "/image/[url]",
            params: {
              beforeUrl: uris[index - 1],
              url: uri,
              afterUrl: uris[index + 1],
            },
          }}
          absolute
          unpressable
        >
          <View
            key={uri}
            borderRadius="$4"
            overflow="hidden"
            width="50%"
            maxHeight={200}
            backgroundColor="$color3"
          >
            <Image
              recyclingKey={uri}
              source={{ uri: formatToCDN(uri) }}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            />
          </View>
        </Link>
      ))}
    </XStack>
  );
};

export const EmbedImage = ({
  uri,
  noBorderRadius,
  skipCdn,
  blurhash,
  disableZoom,
}: {
  uri: string;
  noBorderRadius?: boolean;
  skipCdn?: boolean;
  blurhash?: string;
  disableZoom?: boolean;
}) => {
  const [height, setHeight] = useState(0);

  const Component = (
    <View
      borderRadius={noBorderRadius ? "$0" : "$4"}
      overflow="hidden"
      maxHeight={600}
      onLayout={({ nativeEvent }) => {
        TImage.getSize(uri, (w, h) => {
          if (w > 0) {
            setHeight((h / w) * nativeEvent.layout.width);
          }
        });
      }}
    >
      <Image
        recyclingKey={uri}
        source={{ uri: skipCdn ? uri : formatToCDN(uri) }}
        style={{
          width: "100%",
          height,
        }}
        placeholder={{ blurhash }}
        placeholderContentFit="cover"
      />
    </View>
  );

  if (disableZoom) return Component;

  return (
    <Link
      href={{
        pathname: "/image/[url]",
        params: { url: uri },
      }}
      absolute
      unpressable
    >
      {Component}
    </Link>
  );
};
