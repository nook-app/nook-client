import { PrismaClient } from "../../prisma/feed";
import { RedisClient } from "../../redis";
import { FarcasterClient } from "../farcaster";

export class FeedClient {
  private client: PrismaClient;
  private redis: RedisClient;
  private farcasterClient: FarcasterClient;

  FEED_CACHE_PREFIX = "feed";

  constructor() {
    this.client = new PrismaClient();
    this.redis = new RedisClient();
    this.farcasterClient = new FarcasterClient();
  }

  async connect() {
    await this.client.$connect();
    await this.redis.connect();
  }

  async close() {
    await this.client.$disconnect();
    await this.redis.close();
  }

  async addToFeed(feedId: string, value: string, timestamp: number) {
    await this.redis.addToSet(
      `${this.FEED_CACHE_PREFIX}:${feedId}`,
      value,
      timestamp,
    );
  }

  async batchAddToFeed(
    feedId: string,
    values: { value: string; timestamp: number }[],
  ) {
    await this.redis.batchAddToSet(
      `${this.FEED_CACHE_PREFIX}:${feedId}`,
      values,
    );
  }

  async removeFromFeed(feedId: string, value: string) {
    await this.redis.removeFromSet(
      `${this.FEED_CACHE_PREFIX}:${feedId}`,
      value,
    );
  }

  async addToFeeds(feedIds: string[], value: string, timestamp: number) {
    await this.redis.addToSets(
      feedIds.map((feedId) => `${this.FEED_CACHE_PREFIX}:${feedId}`),
      value,
      timestamp,
    );
  }

  async removeFromFeeds(feedIds: string[], value: string) {
    await this.redis.removeFromSets(
      feedIds.map((feedId) => `${this.FEED_CACHE_PREFIX}:${feedId}`),
      value,
    );
  }

  async getFeed(feedId: string, cursor?: number) {
    return await this.redis.getSet(
      `${this.FEED_CACHE_PREFIX}:${feedId}`,
      cursor,
    );
  }
}
