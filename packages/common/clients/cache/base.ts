import Redis from "ioredis";

// biome-ignore lint/suspicious/noExplicitAny: generic reviver
const reviver = (k: string, v: any): any => {
  if (typeof v === "string") {
    // Check for date string and convert to Date object
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(v)) {
      return new Date(v);
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

// biome-ignore lint/suspicious/noExplicitAny: generic replacer
const replacer = (key: string, value: any) => {
  if (typeof value === "bigint") {
    // Check if the value is a BigInt
    return value.toString(); // Convert BigInt to string
  }
  return value; // Return the value unchanged if not a BigInt
};

export class RedisClient {
  redis: Redis;

  constructor(config: "default" | "feed" = "default") {
    if (config === "feed") {
      this.redis = new Redis({
        host: process.env.FEED_CACHE_HOST,
        port: Number(process.env.FEED_CACHE_PORT),
        username: process.env.FEED_CACHE_USER,
        password: process.env.FEED_CACHE_PASSWORD,
        maxRetriesPerRequest: null,
      });
    } else {
      this.redis = new Redis({
        host: process.env.APP_CACHE_HOST,
        port: Number(process.env.APP_CACHE_PORT),
        username: process.env.APP_CACHE_USER,
        password: process.env.APP_CACHE_PASSWORD,
        maxRetriesPerRequest: null,
      });
    }
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

  async getNumber(key: string) {
    const value = await this.redis.get(key);
    if (value) {
      const num = Number(value);
      if (Number.isNaN(num)) {
        throw new Error(`Value for ${key} is not a number`);
      }
      return num;
    }
    return;
  }

  async setNumber(key: string, value: number, ex?: number) {
    if (ex) {
      await this.redis.set(key, value, "EX", ex);
      return;
    }
    await this.redis.set(key, value);
  }

  async mgetNumber(keys: string[]) {
    if (keys.length === 0) return [];
    const values = await this.redis.mget(keys);
    return values.map((value, index) => {
      if (value) {
        const num = Number(value);
        if (Number.isNaN(num)) {
          throw new Error(`Value for ${keys[index]} is not a number`);
        }
        return num;
      }
      return;
    });
  }

  async msetNumber(pairs: [string, number][], ex?: number) {
    if (pairs.length === 0) return;
    const pipeline = this.redis.pipeline();
    for (const [key, value] of pairs) {
      if (ex) {
        pipeline.set(key, value, "EX", ex);
      } else {
        pipeline.set(key, value);
      }
    }
    await pipeline.exec();
  }

  async exists(key: string) {
    return await this.redis.exists(key);
  }

  async increment(key: string) {
    await this.redis.incr(key);
  }

  async decrement(key: string) {
    await this.redis.decr(key);
  }

  async get(key: string) {
    return await this.redis.get(key);
  }

  async mget(keys: string[]) {
    if (keys.length === 0) return [];
    return await this.redis.mget(keys);
  }

  async set(key: string, value: string, ex?: number) {
    if (ex) {
      await this.redis.set(key, value, "EX", ex);
      return;
    }
    await this.redis.set(key, value);
  }

  async mset(pairs: [string, string][], ex?: number) {
    if (pairs.length === 0) return;
    const pipeline = this.redis.pipeline();
    for (const [key, value] of pairs) {
      if (ex) {
        pipeline.set(key, value, "EX", ex);
      } else {
        pipeline.set(key, value);
      }
    }
    await pipeline.exec();
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  async batchDel(keys: string[]) {
    if (keys.length === 0) return;
    await this.redis.del(keys);
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

  async mgetJson(keys: string[]) {
    if (keys.length === 0) return [];
    const jsons = await this.redis.mget(keys);
    return jsons.map((json) => (json ? JSON.parse(json, reviver) : undefined));
  }

  // biome-ignore lint/suspicious/noExplicitAny: generic setter
  async setJson(key: string, value: any, ex?: number) {
    if (ex) {
      await this.redis.set(key, JSON.stringify(value, replacer), "EX", ex);
      return;
    }
    await this.redis.set(key, JSON.stringify(value, replacer));
  }

  // biome-ignore lint/suspicious/noExplicitAny: generic setter
  async msetJson(pairs: [string, any][], ex?: number) {
    if (pairs.length === 0) return;
    const pipeline = this.redis.pipeline();
    for (const [key, value] of pairs) {
      if (ex) {
        pipeline.set(key, JSON.stringify(value, replacer), "EX", ex);
      } else {
        pipeline.set(key, JSON.stringify(value, replacer));
      }
    }
    await pipeline.exec();
  }

  async addMembers(key: string, members: string[], ex?: number) {
    if (members.length === 0) return;
    if (ex) {
      const pipeline = this.redis.pipeline();
      pipeline.sadd(key, members);
      pipeline.expire(key, ex);
      await pipeline.exec();
      return;
    }
    await this.redis.sadd(key, members);
  }

  async addMember(key: string, member: string, force?: boolean) {
    if (!force) {
      const exists = await this.exists(key);
      if (!exists) return;
    }
    await this.redis.sadd(key, member);
  }

  async checkMember(key: string, member: string) {
    return await this.redis.sismember(key, member);
  }

  async checkMembers(key: string, members: string[]) {
    if (members.length === 0) return [];
    return await this.redis.smismember(key, members);
  }

  async getMembers(key: string) {
    return await this.redis.smembers(key);
  }

  async removeMembers(key: string, members: string[]) {
    if (members.length === 0) return;
    await this.redis.srem(key, members);
  }

  async removeMember(key: string, member: string) {
    await this.redis.srem(key, member);
  }

  // biome-ignore lint/suspicious/noExplicitAny: generic setter
  async addToSet(key: string, value: any, score: number) {
    const pipeline = this.redis.pipeline();
    pipeline.zadd(key, score, JSON.stringify(value));
    pipeline.expire(key, 60 * 60 * 24);
    await pipeline.exec();
  }

  async batchAddToSet(
    key: string,
    // biome-ignore lint/suspicious/noExplicitAny: generic setter
    values: { value: any; score: number }[],
    ex?: number,
  ) {
    const pipeline = this.redis.pipeline();
    for (const value of values) {
      pipeline.zadd(key, value.score, value.value);
    }
    if (ex) {
      pipeline.expire(key, ex);
    } else {
      pipeline.zremrangebyrank(key, 0, -1000);
    }
    await pipeline.exec();
  }

  // biome-ignore lint/suspicious/noExplicitAny: generic setter
  async addToSets(keys: string[], value: any, score: number) {
    const pipeline = this.redis.pipeline();
    for (const key of keys) {
      pipeline.zadd(key, score, JSON.stringify(value));
      pipeline.zremrangebyrank(key, 0, -1000);
    }
    await pipeline.exec();
  }

  // biome-ignore lint/suspicious/noExplicitAny: generic setter
  async removeFromSet(key: string, value: any) {
    await this.redis.zrem(key, JSON.stringify(value));
  }

  // biome-ignore lint/suspicious/noExplicitAny: generic setter
  async removeFromSets(keys: string[], value: any) {
    const pipeline = this.redis.pipeline();
    for (const key of keys) {
      pipeline.zrem(key, JSON.stringify(value));
    }
    await pipeline.exec();
  }

  async getSet(key: string, cursor?: number) {
    return await this.redis.zrevrangebyscore(
      key,
      cursor ? cursor - 1 : "+inf",
      "-inf",
      "WITHSCORES",
      "LIMIT",
      0,
      25,
    );
  }

  async getSetPartition(key: string, start: number) {
    return await this.redis.zrevrangebyscore(
      key,
      "+inf",
      "-inf",
      "WITHSCORES",
      "LIMIT",
      start,
      25,
    );
  }

  async getAllSetData(key: string) {
    const results = await this.redis.zrange(key, 0, -1, "WITHSCORES");

    // Parse results into a more friendly format
    const items = [];
    for (let i = 0; i < results.length; i += 2) {
      items.push({
        value: results[i],
        score: parseFloat(results[i + 1]),
      });
    }

    return items;
  }

  async incrementScore(key: string, value: string, adjustment: number) {
    return await this.redis.zincrby(key, adjustment, value);
  }
}
