import { MongoClient } from "@flink/common/mongo";
import { generateFarcasterPostByContentId } from "@flink/common/utils";
import { createFarcasterContent } from "../../utils";

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

  return await createFarcasterContent(client, contentId, data);
};
