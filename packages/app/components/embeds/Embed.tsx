import { EmbedImage, EmbedImages } from "./EmbedImage";
import { EmbedVideo } from "./EmbedVideo";
import { EmbedUrl } from "./EmbedUrl";
import { EmbedTwitter } from "./EmbedTwitter";
import { Linking } from "react-native";
import { Text, View, XStack, YStack, useTheme } from "@nook/ui";
import { EmbedNook } from "./EmbedNook";
import { FarcasterCastResponse, UrlContentResponse } from "@nook/common/types";
import { formatToCDN } from "../../utils";
import { EmbedCast } from "./EmbedCast";
import { Link } from "@tamagui/lucide-icons";

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
    content.type?.startsWith("image/") ||
    (!content.type && content.uri.includes("imgur.com"))
  ) {
    return (
      <EmbedImage uri={formatToCDN(content.uri, { type: content.type })} />
    );
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

  return <EmbedUrlNoContent uri={content.uri} />;
};

export const Embeds = ({
  cast,
}: {
  cast: FarcasterCastResponse;
}) => {
  const isAllImages = cast.embeds.every(
    (embed) =>
      embed.type?.startsWith("image/") ||
      (!embed.type && embed.uri.includes("imgur.com")),
  );
  if (isAllImages) {
    return (
      <EmbedImages
        uris={cast.embeds.map(({ uri, type }) => formatToCDN(uri, { type }))}
      />
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
  const theme = useTheme();
  return (
    <XStack
      alignItems="center"
      borderColor="$borderColor"
      borderWidth="$0.25"
      borderRadius="$4"
      overflow="hidden"
      onPress={() => Linking.openURL(uri)}
    >
      <View padding="$4" backgroundColor="$color3">
        <Link size="$5" color="$color11" />
      </View>
      <YStack gap="$1" paddingHorizontal="$3" flexShrink={1}>
        <Text fontSize="$3" numberOfLines={1}>
          {uri}
        </Text>
      </YStack>
    </XStack>
  );
};
