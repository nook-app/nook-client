import { RedisClient } from "./base";
import { FarcasterContentReference, UrlContentResponse } from "../../types";

export class ContentCacheClient {
  private redis: RedisClient;

  CONTENT_CACHE_PREFIX = "content";
  REFERENCE_CACHE_PREFIX = "reference";

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async getContent(url: string): Promise<UrlContentResponse | undefined> {
    return await this.redis.getJson(`${this.CONTENT_CACHE_PREFIX}:${url}`);
  }

  async getContents(
    urls: string[],
  ): Promise<(UrlContentResponse | undefined)[]> {
    return await this.redis.mgetJson(
      urls.map((url) => `${this.CONTENT_CACHE_PREFIX}:${url}`),
    );
  }

  async setContent(url: string, content: UrlContentResponse) {
    await this.redis.setJson(
      `${this.CONTENT_CACHE_PREFIX}:${url}`,
      content,
      86400,
    );
  }

  async setContents(contents: UrlContentResponse[]) {
    await this.redis.msetJson(
      contents.map((content) => [
        `${this.CONTENT_CACHE_PREFIX}:${content.uri}`,
        content,
      ]),
      86400,
    );
  }

  async getReferences(
    references: FarcasterContentReference[],
  ): Promise<(UrlContentResponse | undefined)[]> {
    return await this.redis.mgetJson(
      references.map(
        (reference) =>
          `${this.REFERENCE_CACHE_PREFIX}:${reference.hash}:${reference.uri}`,
      ),
    );
  }

  async setReferences(
    references: FarcasterContentReference[],
    contents: UrlContentResponse[],
  ) {
    await this.redis.msetJson(
      references.map((reference, i) => [
        `${this.REFERENCE_CACHE_PREFIX}:${reference.hash}:${reference.uri}`,
        contents[i],
      ]),
      24 * 60 * 60 * 3,
    );
  }
}
