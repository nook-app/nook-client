import { Image } from "expo-image";
import { useState } from "react";
import { View, XStack, Image as TImage } from "tamagui";
import { formatToCDN } from "../../utils";

export const EmbedImages = ({ uris }: { uris: string[] }) => {
  if (uris.length === 1) {
    return <EmbedImage uri={uris[0]} />;
  }

  return (
    <XStack borderRadius="$4" overflow="hidden" gap="$2">
      {uris.map((uri, index) => (
        <View
          key={uri}
          borderRadius="$4"
          overflow="hidden"
          width="50%"
          maxHeight={200}
        >
          <Image
            recyclingKey={uri}
            source={{ uri: formatToCDN(uri) }}
            style={{ width: "100%", height: "100%", resizeMode: "cover" }}
          />
        </View>
      ))}
    </XStack>
  );
};

export const EmbedImage = ({
  uri,
  noBorderRadius,
}: { uri: string; noBorderRadius?: boolean }) => {
  const [height, setHeight] = useState(0);

  return (
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
        source={{ uri: formatToCDN(uri) }}
        style={{
          width: "100%",
          height,
        }}
      />
    </View>
  );
};
