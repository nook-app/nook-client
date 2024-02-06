import { useState } from "react";
import { Image, View } from "tamagui";

export const EmbedImage = ({ embed }: { embed: string }) => {
  const [height, setHeight] = useState(0);

  return (
    <View
      borderRadius="$2"
      overflow="hidden"
      marginTop="$2"
      onLayout={({ nativeEvent }) => {
        if (embed) {
          Image.getSize(embed, (w, h) => {
            setHeight((h / w) * nativeEvent.layout.width);
          });
        }
      }}
    >
      <Image source={{ uri: embed }} height={height} width="100%" />
    </View>
  );
};
