import { MongoClient } from "../mongo";
import { getUrlContent } from "./url";
import { getChainContent } from "./chain";
import { Content } from "../types";
export { getOrCreateChannel } from "./channel";

export const getOrCreateContent = async (
  client: MongoClient,
  contentId: string,
) => {
  const existingContent = await client.findContent(contentId);
  if (existingContent) {
    return existingContent;
  }

  let content: Content | undefined;

  if (contentId.startsWith("http://") || contentId.startsWith("https://")) {
    content = await getUrlContent(contentId);
  }
  if (contentId.startsWith("chain://")) {
    content = await getChainContent(contentId);
  }

  if (!content) {
    return;
  }

  await client.upsertContent(content);
  return content;
};
