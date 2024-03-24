import { FastifyInstance } from "fastify";
import { Prisma, PrismaClient, Nook as DBNook } from "@nook/common/prisma/nook";
import { FarcasterAPIClient } from "@nook/common/clients";
import {
  CreateShelfInstance,
  Nook,
  NookMetadata,
  NookShelf,
  ShelfForm,
  ShelfProtocol,
  ShelfRenderer,
  ShelfType,
  UserFilterType,
} from "@nook/common/types";
import { createHash } from "crypto";
import { decodeCursor, encodeCursor } from "@nook/common/utils";

const MAX_PAGE_SIZE = 25;

function sanitizeInput(input: string): string {
  // Basic example: remove non-alphanumeric characters and truncate
  return input.replace(/[^a-zA-Z0-9\s./]/g, "").substring(0, 100);
}

export class NookService {
  private nookClient: PrismaClient;
  private farcaster: FarcasterAPIClient;

  constructor(fastify: FastifyInstance) {
    this.nookClient = fastify.nook.client;
    this.farcaster = new FarcasterAPIClient();
  }

  async searchNooks(query?: string, cursor?: string) {
    const conditions: string[] = [
      `"deletedAt" IS NULL`,
      `"visibility" = 'PUBLIC'`,
    ];
    if (query) {
      conditions.push(
        `((to_tsvector('english', "name") @@ plainto_tsquery('english', '${sanitizeInput(
          query,
        )}')) OR (to_tsvector('english', "description") @@ plainto_tsquery('english', '${sanitizeInput(
          query,
        )}')))`,
      );
    }

    const decodedCursor = decodeCursor(cursor);
    if (decodedCursor) {
      conditions.push(
        `("Nook".members < ${decodedCursor.members} OR ("Nook".members = ${
          decodedCursor.members
        } AND "Nook"."createdAt" < '${new Date(
          decodedCursor.createdAt,
        ).toISOString()}'))`,
      );
    }

    const whereClause = conditions.join(" AND ");

    const nooks = await this.nookClient.$queryRaw<
      (Nook & { createdAt: Date; members: number })[]
    >(
      Prisma.sql([
        `
      WITH RankedNooks AS (
        SELECT "Nook".*, COUNT(*) AS members,
               ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC, "Nook"."createdAt" DESC) AS rn
        FROM "Nook"
        JOIN "NookMembership" ON "Nook".id = "NookMembership"."nookId"
        GROUP BY "Nook".id
      )
      SELECT *
      FROM RankedNooks
      WHERE ${whereClause}
      ORDER BY members DESC, "createdAt" DESC
      LIMIT ${MAX_PAGE_SIZE}
    `,
      ]),
    );

    return {
      data: nooks,
      nextCursor:
        nooks.length === MAX_PAGE_SIZE
          ? encodeCursor({
              members: nooks[nooks.length - 1].members,
              createdAt: nooks[nooks.length - 1].createdAt.getTime(),
            })
          : null,
    };
  }

  async getNooks(fid: string) {
    const response = await this.nookClient.nook.findMany({
      where: {
        members: {
          some: {
            fid,
          },
        },
        deletedAt: null,
      },
      include: {
        shelves: {
          where: {
            deletedAt: null,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const hasDefaultNook = response.some((nook) => {
      const metadata = nook.metadata as NookMetadata;
      return metadata?.isHome;
    });

    if (!hasDefaultNook) {
      response.unshift(await this.createDefaultNook(fid));
    }

    return response.sort((a, b) => {
      const aIsHome = (a.metadata as NookMetadata)?.isHome;
      const bIsHome = (b.metadata as NookMetadata)?.isHome;
      if (aIsHome && !bIsHome) {
        return -1;
      }
      if (!aIsHome && bIsHome) {
        return 1;
      }
      return 0;
    });
  }

  async createDefaultNook(fid: string) {
    const user = await this.farcaster.getUser(fid);
    if (!user) {
      throw new Error("User not found");
    }

    const defaultNook = await this.nookClient.nook.create({
      data: {
        name: `${user.username || `fid:${fid}`}'s Nook`,
        creatorFid: fid,
        description: "Made just for you",
        imageUrl: user.pfp || null,
        visibility: "PRIVATE",
        metadata: {
          isHome: true,
        },
        shelves: {
          createMany: {
            data: [
              {
                shelfId: "5d347378-58ce-4558-8020-f77847134a0c",
                name: "Trending Now",
                description: "Trending in the last hour",
                creatorFid: fid,
                type: ShelfType.FARCASTER_POSTS,
                renderer: ShelfRenderer.POST_DEFAULT,
                data: {
                  timeWindow: "1h",
                },
              },
              {
                shelfId: "5d347378-58ce-4558-8020-f77847134a0c",
                name: "Trending Today",
                description: "Trending in the last 24 hours",
                creatorFid: fid,
                type: ShelfType.FARCASTER_POSTS,
                renderer: ShelfRenderer.POST_DEFAULT,
                data: {
                  timeWindow: "6h",
                },
              },
              {
                shelfId: "1b1d8924-d10c-444d-aacd-e41873bca312",
                name: "Following",
                description: "Posts from people you follow",
                creatorFid: fid,
                type: ShelfType.FARCASTER_POSTS,
                renderer: ShelfRenderer.POST_DEFAULT,
                data: {
                  users: {
                    type: UserFilterType.FOLLOWING,
                    data: {
                      fid,
                    },
                  },
                  replies: "include",
                },
              },
              {
                shelfId: "1b1d8924-d10c-444d-aacd-e41873bca312",
                name: "Global",
                description: "Posts from everyone",
                creatorFid: fid,
                type: ShelfType.FARCASTER_POSTS,
                renderer: ShelfRenderer.POST_DEFAULT,
                data: {},
              },
              {
                shelfId: "b7c3f089-daf0-49c3-912f-f2a9e4dab618",
                name: "You",
                description: "Your posts and activity",
                creatorFid: fid,
                type: ShelfType.FARCASTER_USER,
                renderer: ShelfRenderer.USER_PROFILE,
                data: {
                  fid,
                },
              },
            ],
          },
        },
        members: {
          create: {
            fid,
          },
        },
      },
      include: {
        shelves: {
          where: {
            deletedAt: null,
          },
        },
      },
    });

    return defaultNook;
  }

  hash(data: object): string {
    const json = JSON.stringify(data);
    const hash = createHash("md5").update(json).digest("hex");
    return hash;
  }

  async getNook(nookId: string) {
    return await this.nookClient.nook.findUnique({
      where: {
        id: nookId,
      },
    });
  }

  async createNook(fid: string, nookData: Nook) {
    const newNook = await this.nookClient.nook.create({
      data: {
        name: nookData.name,
        description: nookData.description,
        imageUrl: nookData.imageUrl,
        visibility: nookData.visibility,
        metadata: nookData.metadata,
        creatorFid: fid,
        members: {
          create: {
            fid: fid,
          },
        },
      },
    });

    return newNook;
  }

  async updateNook(nookId: string, nookData: Nook) {
    await this.nookClient.nook.update({
      where: {
        id: nookId,
      },
      data: {
        name: nookData.name,
        description: nookData.description,
        imageUrl: nookData.imageUrl,
        visibility: nookData.visibility,
        metadata: nookData.metadata,
      },
    });

    return nookData;
  }

  async deleteNook(nookId: string) {
    await this.nookClient.nookMembership.deleteMany({
      where: {
        nookId,
      },
    });
    await this.nookClient.nook.updateMany({
      where: {
        id: nookId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async joinNook(nookId: string, fid: string) {
    await this.nookClient.nookMembership.create({
      data: {
        nookId,
        fid,
      },
    });
  }

  async leaveNook(nookId: string, fid: string) {
    await this.nookClient.nookMembership.deleteMany({
      where: {
        nookId,
        fid,
      },
    });
  }

  async addShelf(nook: DBNook, instance: CreateShelfInstance) {
    return await this.nookClient.shelfInstance.create({
      data: {
        nookId: nook.id,
        shelfId: instance.shelfId,
        name: instance.name,
        creatorFid: instance.creatorFid,
        description: instance.description,
        imageUrl: instance.imageUrl,
        data: instance.data,
        type: instance.type,
        renderer: instance.renderer,
      },
    });
  }

  async removeShelf(nook: DBNook, shelfId: string) {
    await this.nookClient.shelfInstance.updateMany({
      where: {
        id: shelfId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getShelfInstance(shelfId: string) {
    return await this.nookClient.shelfInstance.findUnique({
      where: {
        id: shelfId,
      },
    });
  }

  async getShelf(shelfId: string) {
    return await this.nookClient.shelf.findUnique({
      where: {
        id: shelfId,
      },
    });
  }

  async getShelfOptions(): Promise<NookShelf[]> {
    const shelves = await this.nookClient.shelf.findMany({
      where: {
        enabled: true,
      },
    });
    return shelves.map((shelf) => ({
      id: shelf.id,
      creatorFid: shelf.creatorFid,
      name: shelf.name,
      description: shelf.description || undefined,
      imageUrl: shelf.imageUrl || undefined,
      protocol: shelf.protocol as ShelfProtocol,
      type: shelf.type as ShelfType,
      renderers: shelf.renderers.split(",") as ShelfRenderer[],
      api: shelf.api,
      form: shelf.form as ShelfForm,
    }));
  }
}
