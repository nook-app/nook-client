import { getUrlContent } from "./url";
import { getChainContent } from "./chain";
import { Content } from "../types";

export const getOrCreateContent = async (contentId: string) => {
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

  return content;
};
