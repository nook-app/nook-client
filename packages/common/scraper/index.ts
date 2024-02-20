import { MongoClient } from "../mongo";
import { createUrlContent } from "./url";
import { createChainContent } from "./chain";

export const getOrCreateContent = async (
  client: MongoClient,
  contentId: string,
) => {
  const existingContent = await client.findContent(contentId);
  if (existingContent) {
    return existingContent;
  }

  if (contentId.startsWith("http://") || contentId.startsWith("https://")) {
    return await createUrlContent(client, contentId);
  }
  if (contentId.startsWith("chain://")) {
    return await createChainContent(client, contentId);
  }
};
