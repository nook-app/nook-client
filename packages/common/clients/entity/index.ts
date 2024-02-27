import {
  Entity,
  EntityBlockchain,
  EntityFarcaster,
  EntityUsername,
  Prisma,
  PrismaClient,
} from "../../prisma/entity";
import { RedisClient } from "../../redis";
import { FarcasterUser } from "../../types";

type EntityWithRelations = Entity & {
  farcasterAccounts: EntityFarcaster[];
  blockchainAccounts: EntityBlockchain[];
  usernames: EntityUsername[];
};

export class EntityClient {
  private client: PrismaClient;
  private redis: RedisClient;

  ENTITY_CACHE_PREFIX = "entity";
  FID_CACHE_PREFIX = "fid";

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

  async cacheEntity(entity: EntityWithRelations) {
    await Promise.all([
      this.redis.setJson(`${this.ENTITY_CACHE_PREFIX}:${entity.id}`, entity),
      ...entity.farcasterAccounts.map((farcasterAccount) =>
        this.redis.setJson(
          `${this.FID_CACHE_PREFIX}:${farcasterAccount}`,
          entity,
        ),
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
      include: {
        farcasterAccounts: true,
        blockchainAccounts: true,
        usernames: true,
      },
    });

    if (entity) {
      await this.cacheEntity(entity);
    }

    return entity;
  }

  async getEntitiesByFid(fids: bigint[]) {
    return await Promise.all(fids.map(async (fid) => this.getEntityByFid(fid)));
  }

  async getEntityByFid(fid: bigint) {
    const cached = await this.redis.getJson(`${this.FID_CACHE_PREFIX}:${fid}`);
    if (cached) {
      return cached;
    }

    let entity = await this.fetchEntityByFid(fid);

    if (!entity) {
      entity = await this.createEntityByFid(fid);
    }

    if (entity) {
      await this.cacheEntity(entity);
    }

    return entity;
  }

  async fetchEntityByFid(fid: bigint) {
    return await this.client.entity.findFirst({
      where: {
        farcasterAccounts: {
          some: {
            fid,
          },
        },
      },
      include: {
        farcasterAccounts: true,
        blockchainAccounts: true,
        usernames: true,
      },
    });
  }

  async createEntityByFid(fid: bigint) {
    const response = await fetch(
      `${process.env.FARCASTER_SERVICE_URL}/user/${fid}`,
    );
    if (!response.ok) return null;

    const { user }: { user: FarcasterUser } = await response.json();

    try {
      return await this.client.entity.create({
        data: {
          farcasterAccounts: {
            create: user,
          },
        },
        include: {
          farcasterAccounts: true,
          blockchainAccounts: true,
          usernames: true,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          return await this.fetchEntityByFid(fid);
        }
      }
      throw e;
    }
  }
}
