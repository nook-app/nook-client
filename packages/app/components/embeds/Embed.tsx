import { EmbedImage, EmbedImages } from "./EmbedImage";
import { EmbedVideo } from "./EmbedVideo";
import { EmbedUrl } from "./EmbedUrl";
import { EmbedTwitter } from "./EmbedTwitter";
import { Text, View, XStack, YStack } from "tamagui";
import { EmbedNook } from "./EmbedNook";
import { FarcasterCastResponse, UrlContentResponse } from "@nook/common/types";
import { EmbedCast } from "./EmbedCast";
import { Link as LinkIcon } from "@tamagui/lucide-icons";
import { Link } from "solito/link";
import { EmbedFrame } from "./frames/EmbedFrame";
import { Platform } from "react-native";

export const Embed = ({
  content,
  cast,
}: {
  content: UrlContentResponse;
  cast?: FarcasterCastResponse;
}) => {
  if (
    content.uri.startsWith("nook://") ||
    content.uri.includes("nook.social")
  ) {
    return <EmbedNook content={content} />;
  }

  if (
    content.contentType?.startsWith("image/") ||
    (!content.contentType && content.uri.includes("imgur.com"))
  ) {
    return <EmbedImage uri={content.uri} />;
  }

  if (
    content.contentType?.startsWith("video/") ||
    content.contentType?.startsWith("application/x-mpegURL") ||
    (Platform.OS === "web" &&
      (content.uri.includes("youtube.com") || content.uri.includes("youtu.be")))
  ) {
    return <EmbedVideo uri={content.uri} />;
  }

  if (content.uri.includes("twitter.com") || content.uri.includes("x.com")) {
    return <EmbedTwitter content={content} />;
  }

  if (content.metadata) {
    if (content.frame?.buttons && content.frame?.buttons.length > 0) {
      return <EmbedFrame cast={cast} content={content} />;
    }
    return <EmbedUrl content={content} />;
  }

  return <EmbedUrlNoContent uri={content.uri} />;
};

export const Embeds = ({
  cast,
}: {
  cast: FarcasterCastResponse;
}) => {
  const isAllImages = cast.embeds.every(
    (embed) =>
      embed.contentType?.startsWith("image/") ||
      (!embed.contentType && embed.uri.includes("imgur.com")),
  );
  if (isAllImages) {
    return (
      <>
        <EmbedImages uris={cast.embeds.map(({ uri }) => uri)} />
        {cast.embedCasts.map((embedCast) => (
          <EmbedCast key={embedCast.hash} cast={embedCast} />
        ))}
      </>
    );
  }

  return (
    <>
      {cast.embeds.map((content) => (
        <Embed key={content.uri} cast={cast} content={content} />
      ))}
      {cast.embedCasts.map((embedCast) => (
        <EmbedCast key={embedCast.hash} cast={embedCast} />
      ))}
    </>
  );
};

const EmbedUrlNoContent = ({ uri }: { uri: string }) => {
  return (
    <Link href={uri} target="_blank">
      <XStack
        alignItems="center"
        borderColor="$borderColorBg"
        borderWidth="$0.25"
        borderRadius="$4"
        overflow="hidden"
      >
        <View padding="$4" backgroundColor="$color3">
          <LinkIcon size={24} color="$color11" />
        </View>
        <YStack gap="$1" paddingHorizontal="$3" flexShrink={1}>
          <Text fontSize="$3" numberOfLines={1}>
            {uri}
          </Text>
        </YStack>
      </XStack>
    </Link>
  );
};
