import { Entity, Prisma, PrismaClient } from "../../prisma/entity";
import { RedisClient } from "../../redis";
import { EntityResponse } from "../../types";
import { FarcasterClient } from "../farcaster";

export class EntityClient {
  private client: PrismaClient;
  private redis: RedisClient;
  private farcasterClient: FarcasterClient;

  ENTITY_CACHE_PREFIX = "entity";
  FID_CACHE_PREFIX = "fid";

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

  async getEntitiesForFids(fids: string[]): Promise<EntityResponse[]> {
    const entities = await Promise.all(
      fids.map((fid) => this.getEntityForFid(fid)),
    );
    return entities.filter(Boolean) as EntityResponse[];
  }

  async getEntity(id: string): Promise<EntityResponse> {
    let fid = await this.redis.getJson(`${this.ENTITY_CACHE_PREFIX}:${id}`);

    if (!fid) {
      const entity = await this.client.entity.findFirst({
        where: { id },
      });

      if (!entity) {
        throw new Error("Entity not found");
      }

      fid = entity.fid.toString();
      await this.redis.setJson(`${this.ENTITY_CACHE_PREFIX}:${id}`, fid);
      await this.redis.setJson(`${this.FID_CACHE_PREFIX}:${fid}`, id);
    }

    return {
      id,
      farcaster: await this.farcasterClient.fetchUser(fid),
    };
  }

  async getEntityForFid(fid: string): Promise<EntityResponse | undefined> {
    const id = await this.getEntityIdForFid(fid);

    return {
      id,
      farcaster: await this.farcasterClient.fetchUser(fid),
    };
  }

  async getEntityIdForFid(fid: string): Promise<string> {
    const cached = await this.redis.get(`${this.FID_CACHE_PREFIX}:${fid}`);
    if (cached) return cached;

    let entity = await this.client.entity.findFirst({
      where: { fid: BigInt(fid) },
    });

    if (!entity) {
      entity = await this.createEntityByFid(fid);
    }

    await this.redis.set(`${this.FID_CACHE_PREFIX}:${fid}`, entity.id);
    await this.redis.set(`${this.ENTITY_CACHE_PREFIX}:${entity.id}`, fid);

    return entity.id;
  }

  async cacheEntity(entity: EntityResponse) {
    await Promise.all([
      this.redis.setJson(
        `${this.ENTITY_CACHE_PREFIX}:${entity.id}`,
        entity.farcaster.fid,
      ),
      this.redis.setJson(
        `${this.FID_CACHE_PREFIX}:${entity.farcaster.fid}`,
        entity,
      ),
    ]);
  }

  async fetchEntityByFid(fid: string) {
    return await this.client.entity.findFirst({
      where: { fid: BigInt(fid) },
    });
  }

  async createEntityByFid(fid: string) {
    try {
      return await this.client.entity.create({
        data: {
          fid: BigInt(fid),
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          return (await this.fetchEntityByFid(fid)) as Entity;
        }
      }
      throw e;
    }
  }
}
