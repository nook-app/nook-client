import { UrlContentResponse } from "@nook/common/types";
import { Video, ResizeMode } from "expo-av";
import { useState } from "react";
import { View } from "tamagui";

export const EmbedVideo = ({
  content: { uri },
}: {
  content: UrlContentResponse;
}) => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  return (
    <View
      borderRadius="$2"
      overflow="hidden"
      onLayout={({ nativeEvent }) => {
        if (uri) {
          setWidth(nativeEvent.layout.width);
        }
      }}
    >
      <Video
        style={{
          alignSelf: "center",
          width: "100%",
          height,
        }}
        source={{ uri }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        onReadyForDisplay={(e) => {
          const { width: naturalWidth, height: naturalHeight } = e.naturalSize;
          const aspectRatio = naturalHeight / naturalWidth;
          setHeight(aspectRatio * width);
        }}
      />
    </View>
  );
};
