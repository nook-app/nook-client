import { Content, ContentBase, ContentType } from "@flink/common/types";
import {
  generateFarcasterContent,
  getFarcasterCastByURI,
} from "@flink/common/farcaster";

export const handleFarcasterContent = async (
  content: ContentBase,
): Promise<Content> => {
  const cast = await getFarcasterCastByURI(content.contentId);
  const data = await generateFarcasterContent(cast);

  if ("parentId" in data) {
    return {
      ...content,
      type: ContentType.FARCASTER_REPLY,
      data,
    };
  }

  return {
    ...content,
    type: ContentType.FARCASTER_POST,
    data,
  };
};
