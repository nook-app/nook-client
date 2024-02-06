import { Video, ResizeMode } from "expo-av";
import { useState } from "react";
import { View } from "tamagui";

export const EmbedVideo = ({
  embed,
}: {
  embed: string;
}) => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  return (
    <View
      borderRadius="$2"
      overflow="hidden"
      onLayout={({ nativeEvent }) => {
        if (embed) {
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
        source={{
          uri: embed,
        }}
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
