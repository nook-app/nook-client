import { Content, ContentBase, ContentType } from "@flink/common/types";
import {
  generateFarcasterPost,
  generateFarcasterReply,
  getFarcasterCastByURI,
} from "@flink/common/farcaster";

export const handleFarcasterContent = async (
  content: ContentBase,
): Promise<Content | undefined> => {
  const cast = await getFarcasterCastByURI(content.contentId);
  if (!cast) {
    return;
  }

  if (cast.parentHash) {
    const data = await generateFarcasterReply(cast);
    return {
      ...content,
      type: ContentType.FARCASTER_REPLY,
      data,
    };
  }

  return {
    ...content,
    type: ContentType.FARCASTER_POST,
    data: await generateFarcasterPost(cast),
  };
};
