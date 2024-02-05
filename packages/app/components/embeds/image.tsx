import { useEffect, useState } from "react";
import { Image, View } from "tamagui";
import { useWindowDimensions } from "tamagui";

export const EmbedImage = ({ embed }: { embed: string }) => {
  const { width } = useWindowDimensions();
  const [height, setHeight] = useState(100);

  useEffect(() => {
    if (embed) {
      Image.getSize(embed, (w, h) => {
        setHeight((h / w) * width);
      });
    }
  }, [embed, width]);

  return (
    <View borderRadius="$2" overflow="hidden" marginTop="$2" paddingRight="$2">
      <Image source={{ width, height, uri: embed }} />
    </View>
  );
};
