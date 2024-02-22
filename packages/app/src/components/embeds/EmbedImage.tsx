import { Image } from "expo-image";
import { useState } from "react";
import { Image as TImage, View } from "tamagui";

export const EmbedImage = ({ embed }: { embed: string }) => {
  const [height, setHeight] = useState(0);

  return (
    <View
      borderRadius="$2"
      overflow="hidden"
      marginTop="$2"
      onLayout={({ nativeEvent }) => {
        if (embed) {
          TImage.getSize(embed, (w, h) => {
            if (w > 0) {
              setHeight((h / w) * nativeEvent.layout.width);
            }
          });
        }
      }}
    >
      <Image source={{ uri: embed }} style={{ width: "100%", height }} />
    </View>
  );
};
