import { UrlContentResponse } from "../../types";
import { View } from "@nook/ui";
import ReactPlayer from "react-player";

export const EmbedVideo = ({ content }: { content: UrlContentResponse }) => {
  return (
    <View>
      <ReactPlayer
        url={content.uri}
        controls
        width="100%"
        height="100%"
        style={{ position: "absolute", top: 0, left: 0 }}
      />
    </View>
  );
};
