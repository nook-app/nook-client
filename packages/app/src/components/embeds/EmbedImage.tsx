import { formatToWarpcastCDN } from "@/utils";
import { UrlContentResponse } from "@nook/common/types";
import { Image } from "expo-image";
import { useState } from "react";
import { Image as TImage, View } from "tamagui";

export const EmbedImage = ({
  content: { uri },
}: { content: UrlContentResponse }) => {
  const [height, setHeight] = useState(0);

  const cdnUri = formatToWarpcastCDN(uri);

  return (
    <View
      borderRadius="$2"
      overflow="hidden"
      marginTop="$2"
      onLayout={({ nativeEvent }) => {
        if (cdnUri) {
          TImage.getSize(cdnUri, (w, h) => {
            if (w > 0) {
              setHeight((h / w) * nativeEvent.layout.width);
            }
          });
        }
      }}
    >
      <Image source={{ uri: cdnUri }} style={{ width: "100%", height }} />
    </View>
  );
};
