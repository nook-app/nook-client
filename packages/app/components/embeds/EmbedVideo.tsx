import { Text, View } from "tamagui";
import { UrlContentResponse } from "../../types";
import ReactPlayer from "react-player/lazy";

export const EmbedVideo = ({
  content: { uri },
}: {
  content: UrlContentResponse;
}) => {
  console.log(uri);
  return (
    <View
      overflow="hidden"
      borderRadius="$4"
      onPress={(e) => {
        e.stopPropagation();
      }}
      aspectRatio={
        uri.includes("youtube.com") || uri.includes("youtu.be")
          ? 16 / 9
          : "auto"
      }
    >
      <ReactPlayer url={uri} width="100%" height="100%" controls />
    </View>
  );
};
