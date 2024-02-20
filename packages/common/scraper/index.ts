import { MongoClient } from "../mongo";
import { getUrlContent } from "./url";
import { getChainContent } from "./chain";
import { Content, ContentData } from "../types";
import { getChannelDataFromWarpcast } from "./channel";

export const getOrCreateContent = async (
  client: MongoClient,
  contentId: string,
  channel?: boolean,
) => {
  const existingContent = await client.findContent(contentId);
  if (existingContent) {
    if (channel && !existingContent.channel) {
      existingContent.channel = await getChannelDataFromWarpcast(
        client,
        contentId,
      );
      await client.upsertContent(existingContent);
    }
    return existingContent;
  }

  let content: Content<ContentData> | undefined;

  if (contentId.startsWith("http://") || contentId.startsWith("https://")) {
    content = await getUrlContent(contentId);
  }
  if (contentId.startsWith("chain://")) {
    content = await getChainContent(contentId);
  }

  if (!content) {
    throw new Error("Unsupported content");
  }

  if (channel) {
    content.channel = await getChannelDataFromWarpcast(client, contentId);
  }

  await client.upsertContent(content);
  return content;
};
