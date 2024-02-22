import Redis from "ioredis";
import { Channel, Content, ContentData, Entity } from "../types";
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
    for (const innerKey of Object.keys(v)) {
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

  async close() {
    await this.redis.quit();
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

  async getJsons(keys: string[]) {
    if (keys.length === 0) return [];
    try {
      const jsons = await this.redis.mget(keys);
      return jsons.map((json) =>
        json ? JSON.parse(json, reviver) : undefined,
      );
    } catch (error) {
      throw new Error(`Failed to parse JSONs for ${keys}: ${error}`);
    }
  }

  // biome-ignore lint/suspicious/noExplicitAny: generic setter
  async setJson(key: string, value: any) {
    await this.redis.set(key, JSON.stringify(value), "EX", 60 * 60 * 24);
  }

  async getEntityByFid(fid: string): Promise<Entity> {
    return await this.getJson(`fid:${fid}`);
  }

  async getEntity(id: string): Promise<Entity> {
    return await this.getJson(`entity:${id}`);
  }

  async getEntities(ids: string[]): Promise<Entity[]> {
    return await this.getJsons(ids.map((id) => `entity:${id}`));
  }

  async setEntity(entity: Entity) {
    await Promise.all([
      this.setJson(`entity:${entity._id.toString()}`, entity),
      this.setJson(`fid:${entity.farcaster.fid}`, entity),
    ]);
  }

  async setEntities(entities: Entity[]) {
    if (entities.length === 0) return;
    const keyValuePairs = entities.flatMap((entity) => [
      `entity:${entity._id.toString()}`,
      JSON.stringify(entity),
      `fid:${entity.farcaster.fid}`,
      JSON.stringify(entity),
    ]);
    await this.redis.mset(...keyValuePairs);
  }

  async getContent(contentId: string): Promise<Content<ContentData>> {
    return await this.getJson(`content:${contentId}`);
  }

  async getContents(
    contentIds: string[],
  ): Promise<(Content<ContentData> | undefined)[]> {
    return await this.getJsons(contentIds.map((id) => `content:${id}`));
  }

  async setContent(content: Content<ContentData>) {
    await this.setJson(`content:${content.contentId}`, content);
  }

  async setContents(contents: Content<ContentData>[]) {
    if (contents.length === 0) return;
    const keyValuePairs = contents.flatMap((content) => [
      `content:${content.contentId}`,
      JSON.stringify(content),
    ]);
    await this.redis.mset(...keyValuePairs);
  }

  async getChannels(ids: string[]) {
    return await this.getJsons(ids.map((id) => `channel:${id}`));
  }

  async setChannels(channels: Channel[]) {
    if (channels.length === 0) return;
    const keyValuePairs = channels.flatMap((channel) => [
      `channel:${channel.contentId}`,
      JSON.stringify(channel),
    ]);
    await this.redis.mset(...keyValuePairs);
  }
}
