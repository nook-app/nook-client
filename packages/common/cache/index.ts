import Redis from "ioredis";
import { Content, ContentData, Entity } from "../types";
import { ObjectId } from "mongodb";

// biome-ignore lint/suspicious/noExplicitAny: generic reviver
const reviver = (k: string, v: any): any => {
  if (typeof v === "string") {
    // Check for date string and convert to Date object
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(v)) {
      return new Date(v);
    }
    // Check for MongoDB ObjectId string and convert to ObjectId
    if (k === "_id") {
      return new ObjectId(v);
    }
  } else if (v !== null && typeof v === "object") {
    // If it's an object (but not null), iterate over its properties
    for (const innerKey in Object.keys(v)) {
      v[innerKey] = reviver(innerKey, v[innerKey]);
    }
  } else if (Array.isArray(v)) {
    // If it's an array, iterate over its elements
    return v.map((item, index) => reviver(String(index), item));
  }
  return v;
};

export class RedisClient {
  redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.APP_CACHE_HOST,
      port: Number(process.env.APP_CACHE_PORT),
      username: process.env.APP_CACHE_USER,
      password: process.env.APP_CACHE_PASSWORD,
      maxRetriesPerRequest: null,
    });
  }

  async connect(): Promise<void> {
    if (this.redis.status === "ready") {
      return;
    }
    await new Promise((resolve, reject) => {
      this.redis.once("connect", resolve);
      this.redis.once("error", (error) => {
        console.error(`Failed to connect to Redis: ${error}`);
        process.exit(1);
      });
    });
  }

  async getJson(key: string) {
    try {
      const json = await this.redis.get(key);
      if (!json) return;
      return JSON.parse(json, reviver);
    } catch (error) {
      throw new Error(`Failed to parse JSON for ${key}: ${error}`);
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: generic setter
  async setJson(key: string, value: any) {
    await this.redis.set(key, JSON.stringify(value), "EX", 60 * 60);
  }

  async getEntityByFid(fid: string): Promise<Entity> {
    return await this.getJson(`fid:${fid}`);
  }

  async getEntity(id: string): Promise<Entity> {
    return await this.getJson(`entity:${id}`);
  }

  async setEntity(entity: Entity) {
    await Promise.all([
      this.setJson(`entity:${entity._id.toString()}`, entity),
      this.setJson(`fid:${entity.farcaster.fid}`, entity),
    ]);
  }

  async getContent(contentId: string): Promise<Content<ContentData>> {
    return await this.getJson(`content:${contentId}`);
  }

  async setContent(content: Content<ContentData>) {
    await this.setJson(`content:${content.contentId}`, content);
  }
}
