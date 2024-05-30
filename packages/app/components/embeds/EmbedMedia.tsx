import { EmbedImage, EmbedImages } from "./EmbedImage";
import { EmbedVideo } from "./EmbedVideo";
import { EmbedTwitter } from "./EmbedTwitter";
import { NookText } from "@nook/app-ui";
import { formatToCDN } from "../../utils";
import { FarcasterCastV1, UrlContentResponse } from "@nook/common/types";

export const EmbedMedia = ({
  cast,
}: {
  cast: FarcasterCastV1;
}) => {
  const isAllImages = cast.embeds.every(
    (embed) =>
      embed.contentType?.startsWith("image/") ||
      (!embed.contentType && embed.uri.includes("imgur.com")),
  );
  if (isAllImages) {
    return (
      <EmbedImages
        uris={cast.embeds.map(({ uri, contentType }) =>
          formatToCDN(uri, { type: contentType }),
        )}
      />
    );
  }

  const sortedEmbeds = cast.embeds.sort((a, b) => {
    const aPriority =
      a.contentType?.startsWith("image/") || a.contentType?.startsWith("video/")
        ? 1
        : 0;
    const bPriority =
      b.contentType?.startsWith("image/") || b.contentType?.startsWith("video/")
        ? 1
        : 0;
    return aPriority - bPriority;
  });

  return (
    <>
      {sortedEmbeds.map((content) => (
        <EmbedSingleMedia key={content.uri} content={content} />
      ))}
    </>
  );
};

const EmbedSingleMedia = ({ content }: { content: UrlContentResponse }) => {
  if (
    content.contentType?.startsWith("image/") ||
    (!content.contentType && content.uri.includes("imgur.com"))
  ) {
    return (
      <EmbedImage
        uri={formatToCDN(content.uri, { type: content.contentType })}
      />
    );
  }
  if (
    content.contentType?.startsWith("video/") ||
    content.contentType?.startsWith("application/x-mpegURL")
  ) {
    return <EmbedVideo uri={content.uri} />;
  }

  if (content.uri.includes("twitter.com") || content.uri.includes("x.com")) {
    return <EmbedTwitter content={content} />;
  }

  return <NookText numberOfLines={1}>{content.uri}</NookText>;
};
