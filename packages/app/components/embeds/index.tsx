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

export const Embed = ({
  embed,
  entityMap,
  contentMap,
  widthOffset,
}: {
  embed: string;
  entityMap: Record<string, Entity>;
  contentMap: Record<string, FeedItemContentWithEngagement>;
  widthOffset: number;
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
      const data = content.data as UrlMetadata;
      if (
        content.contentId.includes("imgur.com") ||
        data.contentType?.startsWith("image/")
      ) {
        return (
          <EmbedImage
            key={embed}
            embed={content.contentId}
            widthOffset={widthOffset}
          />
        );
      }

      if (data.metadata?.frame) {
        return <Text key={embed}>"FRAME"</Text>;
      }
      break;
    }
  }

  return <Text key={embed}>{embed}</Text>;
};
