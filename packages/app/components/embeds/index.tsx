import { FeedItemContentWithEngagement } from "@flink/api/types";
import { EmbedImage } from "./image";
import { EmbedQuotePost } from "./quote";
import {
  ContentType,
  Entity,
  PostData,
  UrlMetadata,
} from "@flink/common/types";
import { Text } from "../ui/text";
import { EmbedFrame } from "./frame";

export const Embed = ({
  data,
  embed,
  entityMap,
  contentMap,
}: {
  data: PostData;
  embed: string;
  entityMap: Record<string, Entity>;
  contentMap: Record<string, FeedItemContentWithEngagement>;
}) => {
  const content = contentMap[embed]?.content;
  if (!content) {
    return <Text key={embed}>MISSING {embed}</Text>;
  }

  switch (content.type) {
    case ContentType.POST:
    case ContentType.REPLY: {
      const data = content.data as PostData;
      return (
        <EmbedQuotePost
          key={embed}
          data={data}
          entityMap={entityMap}
          contentMap={contentMap}
        />
      );
    }
    case ContentType.URL: {
      const metadata = content.data as UrlMetadata;
      if (
        content.contentId.includes("imgur.com") ||
        metadata.contentType?.startsWith("image/")
      ) {
        return <EmbedImage key={embed} embed={content.contentId} />;
      }

      if (metadata.metadata?.frame) {
        return <EmbedFrame data={data} metadata={metadata} />;
      }
    }
  }

  return <Text key={embed}>{embed}</Text>;
};
