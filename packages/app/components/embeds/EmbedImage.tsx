import { useState } from "react";
import { View, XStack, Image } from "tamagui";

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
          <Image source={{ uri }} style={{ width: "100%", height: "100%" }} />
        </View>
      ))}
    </XStack>
  );
};

export const EmbedImage = ({ uri }: { uri: string }) => {
  const [height, setHeight] = useState(0);

  return (
    <View
      borderRadius={"$4"}
      overflow="hidden"
      maxHeight={600}
      onLayout={({ nativeEvent }) => {
        Image.getSize(uri, (w, h) => {
          if (w > 0) {
            setHeight((h / w) * nativeEvent.layout.width);
          }
        });
      }}
    >
      <Image
        source={{ uri }}
        style={{
          width: "100%",
          height,
        }}
      />
    </View>
  );
};
