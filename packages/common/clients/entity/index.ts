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

  async cacheEntity(entity: EntityResponse) {
    await Promise.all([
      this.redis.setJson(`${this.ENTITY_CACHE_PREFIX}:${entity.id}`, entity),
      this.redis.setJson(
        `${this.FID_CACHE_PREFIX}:${entity.farcaster.fid}`,
        entity,
      ),
    ]);
  }

  async getEntity(entityId: string) {
    const cached = await this.redis.getJson(
      `${this.ENTITY_CACHE_PREFIX}:${entityId}`,
    );
    if (cached) return cached;

    const entity = await this.client.entity.findUnique({
      where: {
        id: entityId,
      },
    });

    if (!entity) {
      throw new Error(`Could not find entity with id ${entityId}`);
    }

    const farcaster = await this.farcasterClient.getUser(entity.fid.toString());

    const response: EntityResponse = {
      id: entity.id,
      farcaster,
    };

    await this.cacheEntity(response);
    return response;
  }

  async getEntitiesByFid(fids: string[]) {
    return await Promise.all(fids.map(async (fid) => this.getEntityByFid(fid)));
  }

  async getEntityByFid(fid: string): Promise<EntityResponse> {
    const cached = await this.redis.getJson(`${this.FID_CACHE_PREFIX}:${fid}`);

    if (cached) {
      return cached;
    }

    let entity = await this.fetchEntityByFid(fid);

    if (!entity) {
      entity = await this.createEntityByFid(fid);
    }

    const farcaster = await this.farcasterClient.getUser(fid);

    const response: EntityResponse = {
      id: entity.id,
      farcaster,
    };

    await this.cacheEntity(response);
    return response;
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
