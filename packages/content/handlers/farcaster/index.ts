import { MongoClient } from "@flink/common/mongo";
import {
  getOrCreateContent,
  getFarcasterPostOrReplyByContentId,
} from "../../utils";

export const handleFarcasterContent = async (
  client: MongoClient,
  contentId: string,
) => {
  const { content, created } = await getFarcasterPostOrReplyByContentId(
    client,
    contentId,
  );

  if (created) {
    await getOrCreateContent(client, content);
  }

  return content;
};
