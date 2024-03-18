import { FastifyInstance } from "fastify";
import { Prisma, PrismaClient, Nook as DBNook } from "@nook/common/prisma/nook";
import { FarcasterAPIClient } from "@nook/common/clients";
import {
  CreateShelfRequest,
  DisplayMode,
  FarcasterFeedFilter,
  FeedFilter,
  Nook,
  NookMetadata,
  NookShelf,
  NookShelfType,
  UserFilterType,
} from "@nook/common/types";
import { randomUUID, createHash } from "crypto";
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
    const nooks = await this.nookClient.nookMembership.findMany({
      where: {
        user: {
          fid,
        },
        nook: {
          deletedAt: null,
          visibility: "PUBLIC",
        },
      },
      include: {
        nook: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const response = nooks.map((membership) => membership.nook);

    if (
      !nooks.find(
        (nook) => nook.nook.name === "Home" && nook.nook.creatorFid === fid,
      )
    ) {
      response.unshift(await this.getHomeNook(fid));
    }

    return response.sort((a, b) => {
      if (a.name === "Home") {
        return -1;
      }
      if (b.name === "Home") {
        return 1;
      }
      return 0;
    });
  }

  async getHomeNook(fid: string) {
    let homeNook = await this.nookClient.nook.findFirst({
      where: {
        name: "Home",
        creatorFid: fid,
      },
    });

    if (!homeNook) {
      const user = await this.farcaster.getUser(fid);
      if (!user) {
        throw new Error("User not found");
      }
      homeNook = await this.nookClient.nook.create({
        data: {
          name: "Home",
          creatorFid: fid,
          description: "Your personal nook",
          imageUrl: user.pfp || null,
          visibility: "PRIVATE",
          metadata: await this.getHomeNookMetadata(fid),
        },
      });
    }

    await this.nookClient.nookMembership.upsert({
      where: {
        fid_nookId: {
          nookId: homeNook.id,
          fid,
        },
      },
      create: {
        user: {
          connect: {
            fid,
          },
        },
        nook: {
          connect: {
            id: homeNook.id,
          },
        },
      },
      update: {},
    });

    return homeNook;
  }

  async getHomeNookMetadata(fid: string): Promise<NookMetadata> {
    const [globalFeedId, discoverFeedId, followingFeedId] = await Promise.all([
      this.getGlobalFeedId(),
      this.getDiscoverFeedId(fid),
      this.getFollowingFeedId(fid),
    ]);

    const followingShelf: NookShelf = {
      id: randomUUID(),
      name: "Posts",
      description: "Posts from people you follow",
      service: "FARCASTER",
      type: NookShelfType.FARCASTER_FEED,
      data: {
        api: "/v0/feeds/farcaster",
        args: {
          feedId: followingFeedId,
        },
        displayMode: DisplayMode.DEFAULT,
      },
    };

    const discoverShelf: NookShelf = {
      id: randomUUID(),
      name: "Discover",
      description: "Posts you may like",
      service: "FARCASTER",
      type: NookShelfType.FARCASTER_FEED,
      data: {
        api: "/v0/feeds/farcaster",
        args: {
          feedId: discoverFeedId,
        },
        displayMode: DisplayMode.DEFAULT,
      },
    };

    const globalShelf: NookShelf = {
      id: randomUUID(),
      name: "Global",
      description: "Posts from everyone",
      service: "FARCASTER",
      type: NookShelfType.FARCASTER_FEED,
      data: {
        api: "/v0/feeds/farcaster",
        args: {
          feedId: globalFeedId,
        },
        displayMode: DisplayMode.DEFAULT,
      },
    };

    const profileShelf: NookShelf = {
      id: randomUUID(),
      name: "Profile",
      description: "Your posts and activity",
      service: "FARCASTER",
      type: NookShelfType.FARCASTER_PROFILE,
      data: {
        fid,
      },
    };

    return {
      categories: [
        {
          id: randomUUID(),
          name: "Following",
          shelves: [followingShelf.id],
        },
        {
          id: randomUUID(),
          name: "Explore",
          shelves: [discoverShelf.id, globalShelf.id],
        },
        {
          id: randomUUID(),
          name: "You",
          shelves: [profileShelf.id],
        },
      ],
      shelves: [followingShelf, discoverShelf, globalShelf, profileShelf],
    };
  }

  async getGlobalFeedId() {
    const filter: FarcasterFeedFilter = {};
    const feed = await this.getOrCreateFeed(filter, "FARCASTER_FEED", "262426");
    return feed.id;
  }

  async getDiscoverFeedId(fid: string) {
    const filter: FarcasterFeedFilter = {
      userFilter: {
        type: UserFilterType.FOLLOWING,
        args: {
          fid,
          degree: 2,
        },
      },
    };
    const feed = await this.getOrCreateFeed(filter, "FARCASTER_FEED", "262426");
    return feed.id;
  }

  async getFollowingFeedId(fid: string) {
    const filter: FarcasterFeedFilter = {
      userFilter: {
        type: UserFilterType.FOLLOWING,
        args: {
          fid,
          degree: 1,
        },
      },
    };
    const feed = await this.getOrCreateFeed(filter, "FARCASTER_FEED", "262426");
    return feed.id;
  }

  async getFarcasterFeed(feedId: string, cursor?: string, viewerFid?: string) {
    const feed = await this.nookClient.feed.findUnique({
      where: {
        id: feedId,
      },
    });
    if (!feed) {
      return;
    }

    const response = await this.farcaster.getFeed(
      {
        filter: feed.filter as FarcasterFeedFilter,
        context: {
          viewerFid,
        },
      },
      cursor,
    );

    return response;
  }

  async getOrCreateFeed(filter: FeedFilter, type: string, fid: string) {
    const hash = this.hash(filter);
    const feed = await this.nookClient.feed.findUnique({
      where: {
        hash,
      },
    });

    if (feed) {
      return feed;
    }

    const newFeed = await this.nookClient.feed.create({
      data: {
        type,
        hash,
        filter,
        creatorFid: fid,
      },
    });

    return newFeed;
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
        ...nookData,
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
      data: nookData,
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

  async addShelf(nook: DBNook, shelf: CreateShelfRequest, fid: string) {
    const metadata = nook.metadata as NookMetadata | undefined;

    let newShelf: NookShelf | undefined;
    switch (shelf.type) {
      case NookShelfType.TRANSACTION_FEED: {
        const feed = await this.getOrCreateFeed(
          shelf.data.args.filter,
          shelf.type,
          fid,
        );
        newShelf = {
          ...shelf,
          id: randomUUID(),
          service: "ONCEUPON",
          data: {
            ...shelf.data,
            args: {
              feedId: feed.id,
            },
          },
        };
        break;
      }
      case NookShelfType.FARCASTER_EVENTS: {
        const feed = await this.getOrCreateFeed(
          shelf.data.args.filter,
          shelf.type,
          fid,
        );
        newShelf = {
          ...shelf,
          id: randomUUID(),
          service: "FARCASTER",
          data: {
            ...shelf.data,
            args: {
              feedId: feed.id,
            },
          },
        };
        break;
      }
      case NookShelfType.FARCASTER_FEED: {
        const feed = await this.getOrCreateFeed(
          shelf.data.args.filter,
          shelf.type,
          fid,
        );
        newShelf = {
          ...shelf,
          id: randomUUID(),
          service: "FARCASTER",
          data: {
            ...shelf.data,
            args: {
              feedId: feed.id,
            },
          },
        };
        break;
      }
      case NookShelfType.FARCASTER_PROFILE:
        newShelf = {
          ...shelf,
          service: "FARCASTER",
          id: randomUUID(),
        };
        break;
    }

    if (!newShelf) {
      throw new Error("Invalid shelf type");
    }

    const newNook = {
      ...nook,
      metadata: {
        ...metadata,
        shelves: [...(metadata?.shelves || []), newShelf],
      },
    };

    await this.nookClient.nook.update({
      where: {
        id: nook.id,
      },
      data: {
        metadata: newNook.metadata,
      },
    });

    return {
      nook: newNook,
      shelf: newShelf,
    };
  }

  async removeShelf(nook: DBNook, shelfId: string) {
    const metadata = nook.metadata as NookMetadata | undefined;
    const categories = metadata?.categories?.map((category) => ({
      ...category,
      shelves: category.shelves.filter((shelf) => shelf !== shelfId),
    }));

    await this.nookClient.nook.update({
      where: {
        id: nook.id,
      },
      data: {
        metadata: {
          ...metadata,
          categories,
          shelves: metadata?.shelves?.filter((shelf) => shelf.id !== shelfId),
        },
      },
    });
  }
}
