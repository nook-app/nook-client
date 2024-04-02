import { RedisClient } from "./base";
import { UrlContentResponse } from "../../types";

export class ContentCacheClient {
  private redis: RedisClient;

  CONTENT_CACHE_PREFIX = "content";

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async getContent(url: string): Promise<UrlContentResponse> {
    return await this.redis.getJson(`${this.CONTENT_CACHE_PREFIX}:${url}`);
  }

  async setContent(url: string, content: UrlContentResponse) {
    await this.redis.setJson(
      `${this.CONTENT_CACHE_PREFIX}:${url}`,
      content,
      86400,
    );
  }
}
