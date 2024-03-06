import { RedisClient } from "./base";
import { UrlContentResponse } from "../../types";

export class ContentCacheClient extends RedisClient {
  CONTENT_CACHE_PREFIX = "content";

  async getContent(url: string): Promise<UrlContentResponse> {
    return await this.getJson(`${this.CONTENT_CACHE_PREFIX}:${url}`);
  }

  async setContent(url: string, content: UrlContentResponse) {
    await this.setJson(`${this.CONTENT_CACHE_PREFIX}:${url}`, content);
  }
}
