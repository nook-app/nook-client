import { RedisClient } from "./base";
import { FarcasterContentReference, UrlContentResponse } from "../../types";

const unquote = (uri: string) => uri.replace(/"/g, "").replace(/'/g, "");

export class ContentCacheClient {
  private redis: RedisClient;

  CONTENT_CACHE_PREFIX = "content";
  REFERENCE_CACHE_PREFIX = "reference";

  constructor(redis: RedisClient) {
    this.redis = redis;
  }

  async getContent(url: string): Promise<UrlContentResponse | undefined> {
    return await this.redis.getJson(
      `${this.CONTENT_CACHE_PREFIX}:${unquote(url)}`,
    );
  }

  async getContents(
    urls: string[],
  ): Promise<(UrlContentResponse | undefined)[]> {
    return await this.redis.mgetJson(
      urls.map((url) => `${this.CONTENT_CACHE_PREFIX}:${unquote(url)}`),
    );
  }

  async setContent(url: string, content: UrlContentResponse) {
    await this.redis.setJson(
      `${this.CONTENT_CACHE_PREFIX}:${unquote(url)}`,
      content,
      86400,
    );
  }

  async setContents(contents: UrlContentResponse[]) {
    await this.redis.msetJson(
      contents.map((content) => [
        `${this.CONTENT_CACHE_PREFIX}:${unquote(content.uri)}`,
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
          `${this.REFERENCE_CACHE_PREFIX}:${reference.hash}:${unquote(
            reference.uri,
          )}`,
      ),
    );
  }

  async setReferences(
    pairs: [FarcasterContentReference, UrlContentResponse][],
  ) {
    await this.redis.msetJson(
      pairs.map((pair, i) => [
        `${this.REFERENCE_CACHE_PREFIX}:${pair[0].hash}:${unquote(
          pair[0].uri,
        )}`,
        pair[1],
      ]),
      24 * 60 * 60 * 3,
    );
  }
}
