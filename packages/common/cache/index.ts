import Redis from "ioredis";
import { Entity } from "../types";
import { ObjectId } from "mongodb";

export class RedisClient {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: process.env.APP_DRAGONFLY_HOST,
      port: Number(process.env.APP_DRAGONFLY_PORT),
      username: process.env.APP_DRAGONFLY_USER,
      password: process.env.APP_DRAGONFLY_PASSWORD,
      maxRetriesPerRequest: null,
    });
  }

  async getEntityByFid(fid: string) {
    const entityJson = await this.redis.get(`fid:${fid}`);
    if (!entityJson) return;

    try {
      const entity: Entity = JSON.parse(entityJson, (k, v) => {
        // Check for ISO date string pattern and convert back to Date
        if (
          typeof v === "string" &&
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(v)
        ) {
          return new Date(v);
        }
        // Check for ObjectId pattern (24 hex characters) and convert back to ObjectId
        if (typeof v === "string" && /^[0-9a-fA-F]{24}$/.test(v)) {
          return new ObjectId(v);
        }
        return v;
      });
      return entity;
    } catch (error) {
      console.error("Failed to parse entity JSON", error);
      return;
    }
  }

  async getEntity(id: string) {
    const entityJson = await this.redis.get(`entity:${id}`);
    if (!entityJson) return;

    try {
      const entity: Entity = JSON.parse(entityJson, (k, v) => {
        // Check for ISO date string pattern and convert back to Date
        if (
          typeof v === "string" &&
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(v)
        ) {
          return new Date(v);
        }
        // Check for ObjectId pattern (24 hex characters) and convert back to ObjectId
        if (typeof v === "string" && /^[0-9a-fA-F]{24}$/.test(v)) {
          return new ObjectId(v);
        }
        return v;
      });
      return entity;
    } catch (error) {
      console.error("Failed to parse entity JSON", error);
      return;
    }
  }

  async setEntity(entity: Entity) {
    await Promise.all([
      this.redis.set(
        `entity:${entity._id.toString()}`,
        JSON.stringify(entity),
        "EX",
        60 * 60,
      ),
      this.redis.set(
        `fid:${entity.farcaster.fid}`,
        JSON.stringify(entity),
        "EX",
        60 * 60,
      ),
    ]);
  }
}
