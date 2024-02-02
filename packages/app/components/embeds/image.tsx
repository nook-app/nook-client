import { useEffect, useState } from "react";
import { Image, View } from "tamagui";
import { useWindowDimensions } from "tamagui";

export const EmbedImage = ({
  embed,
  widthOffset = 0,
}: { embed: string; widthOffset?: number }) => {
  const { width: dWidth } = useWindowDimensions();
  const [height, setHeight] = useState(100);

  const width = dWidth - widthOffset;

  useEffect(() => {
    if (embed) {
      Image.getSize(embed, (w, h) => {
        setHeight((h / w) * width);
      });
    }
  }, [embed, width]);

  return (
    <View borderRadius="$2" overflow="hidden" marginTop="$2">
      <Image source={{ width, height, uri: embed }} />
    </View>
  );
};
