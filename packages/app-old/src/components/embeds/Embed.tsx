import { EmbedImage } from "./EmbedImage";
import { EmbedVideo } from "./EmbedVideo";
import { EmbedUrl } from "./EmbedUrl";
import { EmbedTwitter } from "./EmbedTwitter";
import { UrlContentResponse } from "@nook/common/types";
import { Linking } from "react-native";
import { Text } from "tamagui";

export const Embed = ({
  content,
}: {
  content: UrlContentResponse;
}) => {
  if (content.type?.startsWith("image/")) {
    return <EmbedImage content={content} />;
  }
  if (
    content.type?.startsWith("video/") ||
    content.type?.startsWith("application/x-mpegURL")
  ) {
    return <EmbedVideo content={content} />;
  }
  if (content.uri.includes("twitter.com") || content.uri.includes("x.com")) {
    return <EmbedTwitter content={content} />;
  }
  if (content.metadata) {
    return <EmbedUrl content={content} />;
  }

  return (
    <Text onPress={() => Linking.openURL(content.uri)}>{content.uri}</Text>
  );
};
