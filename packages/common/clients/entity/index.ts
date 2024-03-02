import { UserDataType } from "@farcaster/hub-nodejs";
import { Entity, Prisma, PrismaClient } from "../../prisma/entity";
import { RedisClient } from "../../redis";
import { EntityResponse, FarcasterUser } from "../../types";
import { PrismaClient as FarcasterPrismaClient } from "../../prisma/farcaster";

export class EntityClient {
  private client: PrismaClient;
  private redis: RedisClient;
  private farcasterClient: FarcasterPrismaClient;

  ENTITY_CACHE_PREFIX = "entity";
  FID_CACHE_PREFIX = "fid";

  constructor() {
    this.client = new PrismaClient();
    this.redis = new RedisClient();
    this.farcasterClient = new FarcasterPrismaClient();
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

    const farcaster = await this.getFarcasterUser(entity.fid);

    const response: EntityResponse = {
      id: entity.id,
      farcaster,
    };

    await this.cacheEntity(response);
    return response;
  }

  async getEntitiesByFid(fids: bigint[]) {
    return await Promise.all(fids.map(async (fid) => this.getEntityByFid(fid)));
  }

  async getEntityByFid(fid: bigint): Promise<EntityResponse> {
    const cached = await this.redis.getJson(`${this.FID_CACHE_PREFIX}:${fid}`);
    if (cached) {
      return cached;
    }

    let entity = await this.fetchEntityByFid(fid);

    if (!entity) {
      entity = await this.createEntityByFid(fid);
    }

    const farcaster = await this.getFarcasterUser(fid);

    const response: EntityResponse = {
      id: entity.id,
      farcaster,
    };

    await this.cacheEntity(response);
    return response;
  }

  async fetchEntityByFid(fid: bigint) {
    return await this.client.entity.findFirst({
      where: { fid },
    });
  }

  async createEntityByFid(fid: bigint) {
    try {
      return await this.client.entity.create({
        data: {
          fid,
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

  async getFarcasterUser(fid: bigint): Promise<FarcasterUser> {
    const [userData, followers, following] = await Promise.all([
      this.farcasterClient.farcasterUserData.findMany({
        where: { fid },
      }),
      this.getFollowers(fid),
      this.getFollowing(fid),
    ]);
    if (!userData) {
      throw new Error(`Could not find user data for fid ${fid}`);
    }

    const username = userData.find((d) => d.type === UserDataType.USERNAME);
    const pfp = userData.find((d) => d.type === UserDataType.PFP);
    const displayName = userData.find((d) => d.type === UserDataType.DISPLAY);
    const bio = userData.find((d) => d.type === UserDataType.BIO);
    const url = userData.find((d) => d.type === UserDataType.URL);

    return {
      fid,
      username: username?.value,
      pfp: pfp?.value,
      displayName: displayName?.value,
      bio: bio?.value,
      url: url?.value,
      followers,
      following,
    };
  }

  async getFollowing(fid: bigint): Promise<number> {
    return await this.farcasterClient.farcasterLink.count({
      where: {
        fid,
        linkType: "follow",
      },
    });
  }

  async getFollowers(fid: bigint): Promise<number> {
    return await this.farcasterClient.farcasterLink.count({
      where: {
        linkType: "follow",
        targetFid: fid,
      },
    });
  }
}
