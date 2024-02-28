import { PrismaClient } from "../../prisma/feed";
import { RedisClient } from "../../redis";

export class FeedClient {
  private client: PrismaClient;
  private redis: RedisClient;

  FEED_CACHE_PREFIX = "feed";

  constructor() {
    this.client = new PrismaClient();
    this.redis = new RedisClient();
  }

  async connect() {
    await this.client.$connect();
    await this.redis.connect();
  }

  async close() {
    await this.client.$disconnect();
    await this.redis.close();
  }

  async addToFeed(feedId: string, value: string) {
    await this.redis.push(`${this.FEED_CACHE_PREFIX}:${feedId}`, value);
  }

  async removeFromFeed(feedId: string, value: string) {
    await this.redis.remove(`${this.FEED_CACHE_PREFIX}:${feedId}`, value);
  }

  async addToFeeds(feedIds: string[], value: string) {
    await this.redis.batchPush(
      feedIds.map((feedId) => `${this.FEED_CACHE_PREFIX}:${feedId}`),
      value,
    );
  }

  async removeFromFeeds(feedIds: string[], value: string) {
    await this.redis.batchRemove(
      feedIds.map((feedId) => `${this.FEED_CACHE_PREFIX}:${feedId}`),
      value,
    );
  }

  async getFeed(feedId: string) {
    return await this.redis.getList(`${this.FEED_CACHE_PREFIX}:${feedId}`);
  }
}
