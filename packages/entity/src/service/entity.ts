import { FarcasterClient } from "@nook/common/clients";
import { Entity, Prisma, PrismaClient } from "@nook/common/prisma/entity";
import { RedisClient } from "@nook/common/redis";
import {
  BaseFarcasterUserWithEngagement,
  EntityResponse,
} from "@nook/common/types";
import { FastifyInstance } from "fastify";

export class EntityService {
  private client: PrismaClient;
  private redis: RedisClient;
  private farcasterClient: FarcasterClient;

  ENTITY_CACHE_PREFIX = "entity";
  FID_CACHE_PREFIX = "fid";

  constructor(fastify: FastifyInstance) {
    this.client = fastify.entity.client;
    this.redis = fastify.redis.client;
    this.farcasterClient = new FarcasterClient();
  }

  async getEntitiesForFids(
    fids: string[],
    viewerFid?: string,
  ): Promise<EntityResponse[]> {
    const ids = await Promise.all(
      fids.map((fid) => this.getEntityIdForFid(fid, viewerFid)),
    );
    const farcaster = await this.farcasterClient.fetchUsers(fids, viewerFid);
    const farcasterMap = farcaster.data.reduce(
      (acc, user) => {
        acc[user.fid] = user;
        return acc;
      },
      {} as Record<string, BaseFarcasterUserWithEngagement>,
    );
    return ids.map((id) => ({
      id: id.id,
      farcaster: farcasterMap[id.fid],
    }));
  }

  async getEntityIdForFid(
    fid: string,
    viewerFid?: string,
  ): Promise<{ id: string; fid: string }> {
    let id = await this.redis.get(`${this.FID_CACHE_PREFIX}:${fid}`);

    if (!id) {
      let entity = await this.client.entity.findFirst({
        where: { fid: parseInt(fid) },
      });

      if (!entity) {
        entity = await this.createEntityForFid(fid);
      }

      id = entity.id;

      await Promise.all([
        this.redis.set(`${this.ENTITY_CACHE_PREFIX}:${id}`, fid),
        this.redis.set(`${this.FID_CACHE_PREFIX}:${fid}`, id),
      ]);
    }

    return { id, fid };
  }

  async getEntityForFid(
    fid: string,
    viewerFid?: string,
  ): Promise<EntityResponse | undefined> {
    const { id } = await this.getEntityIdForFid(fid, viewerFid);

    return {
      id,
      farcaster: await this.farcasterClient.fetchUser(fid, viewerFid),
    };
  }

  async getEntity(id: string, viewerFid?: string): Promise<EntityResponse> {
    let fid = await this.redis.get(`${this.ENTITY_CACHE_PREFIX}:${id}`);

    if (!fid) {
      const entity = await this.client.entity.findFirst({
        where: { id },
      });

      if (!entity) {
        throw new Error("Entity not found");
      }

      fid = entity.fid.toString();
      await Promise.all([
        this.redis.set(`${this.ENTITY_CACHE_PREFIX}:${id}`, fid),
        this.redis.set(`${this.FID_CACHE_PREFIX}:${fid}`, id),
      ]);
    }

    return {
      id,
      farcaster: await this.farcasterClient.fetchUser(fid, viewerFid),
    };
  }

  async createEntityForFid(fid: string) {
    try {
      return await this.client.entity.create({
        data: {
          fid: BigInt(fid),
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === "P2002") {
          return (await this.client.entity.findFirst({
            where: { fid: BigInt(fid) },
          })) as Entity;
        }
      }
      throw e;
    }
  }
}
