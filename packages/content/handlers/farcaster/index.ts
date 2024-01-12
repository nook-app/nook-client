import { MongoClient } from "@flink/common/mongo";
import { generateFarcasterPostByContentId } from "@flink/common/utils";
import { insertPostContent } from "../../utils";

export const handleFarcasterContent = async (
  client: MongoClient,
  contentId: string,
) => {
  const existingContent = await client.findContent(contentId);
  if (existingContent) {
    return existingContent;
  }

  const data = await generateFarcasterPostByContentId(client, contentId);
  if (!data) {
    return;
  }

  return await insertPostContent(client, contentId, data);
};
