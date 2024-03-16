import { FastifyInstance } from "fastify";
import { PrismaClient } from "@nook/common/prisma/nook";
import { FarcasterAPIClient } from "@nook/common/clients";
import {
  FarcasterFeedFilter,
  NookMetadata,
  UserFilterType,
} from "@nook/common/types";
import { randomUUID, createHash } from "crypto";

export class NookService {
  private nookClient: PrismaClient;
  private farcaster: FarcasterAPIClient;

  constructor(fastify: FastifyInstance) {
    this.nookClient = fastify.nook.client;
    this.farcaster = new FarcasterAPIClient();
  }

  async getNooks(fid: string) {
    const memberships = await this.nookClient.nookMembership.findMany({
      where: {
        user: {
          fid,
        },
      },
      orderBy: {
        index: "asc",
      },
    });

    const nooks = await this.nookClient.nook.findMany({
      where: {
        id: {
          in: memberships.map((membership) => membership.nookId),
        },
      },
    });

    let homeNook =
      nooks.find((nook) => nook.name === "Home" && nook.creatorFid === fid) ||
      null;

    if (!homeNook) {
      homeNook = await this.getHomeNook(
        fid,
        memberships[memberships.length - 1]?.index + 1,
      );
      nooks.push(homeNook);
    }

    return nooks;
  }

  async getHomeNook(fid: string, index?: number) {
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

    await this.nookClient.nookMembership.create({
      data: {
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
        index: index || 0,
      },
    });

    return homeNook;
  }

  async getHomeNookMetadata(fid: string): Promise<NookMetadata> {
    const [globalFeedId, discoverFeedId, followingFeedId] = await Promise.all([
      this.getGlobalFeedId(),
      this.getDiscoverFeedId(fid),
      this.getFollowingFeedId(fid),
    ]);
    return {
      categories: [
        {
          id: randomUUID(),
          name: "Following",
          shelves: [
            {
              id: randomUUID(),
              name: "Posts",
              description: "Posts from people you follow",
              service: "FARCASTER",
              type: "FARCASTER_FEED",
              data: {
                api: "/v0/feeds/farcaster",
                args: {
                  feedId: followingFeedId,
                },
                displayMode: "DEFAULT",
              },
            },
          ],
        },
        {
          id: randomUUID(),
          name: "Explore",
          shelves: [
            {
              id: randomUUID(),
              name: "Discover",
              description: "Posts you may like",
              service: "FARCASTER",
              type: "FARCASTER_FEED",
              data: {
                api: "/v0/feeds/farcaster",
                args: {
                  feedId: discoverFeedId,
                },
                displayMode: "DEFAULT",
              },
            },
            {
              id: randomUUID(),
              name: "Global",
              description: "Posts from everyone",
              service: "FARCASTER",
              type: "FARCASTER_FEED",
              data: {
                api: "/v0/feeds/farcaster",
                args: {
                  feedId: globalFeedId,
                },
                displayMode: "DEFAULT",
              },
            },
          ],
        },
        {
          id: randomUUID(),
          name: "You",
          shelves: [
            {
              id: randomUUID(),
              name: "Profile",
              description: "Your posts and activity",
              service: "FARCASTER",
              type: "FARCASTER_PROFILE",
              data: {
                fid,
              },
            },
          ],
        },
      ],
    };
  }

  async getGlobalFeedId() {
    const filter: FarcasterFeedFilter = {};
    const hash = this.hash(filter);
    const feed = await this.nookClient.feed.findUnique({
      where: {
        hash,
      },
    });

    if (feed) {
      return feed.id;
    }

    const newFeed = await this.nookClient.feed.create({
      data: {
        type: "FARCASTER_FEED",
        hash,
        filter,
        creatorFid: "262426",
      },
    });

    return newFeed.id;
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

    const hash = this.hash(filter);

    const feed = await this.nookClient.feed.findUnique({
      where: {
        hash,
      },
    });

    if (feed) {
      return feed.id;
    }

    const newFeed = await this.nookClient.feed.create({
      data: {
        type: "FARCASTER_FEED",
        hash,
        filter,
        creatorFid: "262426",
      },
    });

    return newFeed.id;
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

    const hash = this.hash(filter);

    const feed = await this.nookClient.feed.findUnique({
      where: {
        hash,
      },
    });

    if (feed) {
      return feed.id;
    }

    const newFeed = await this.nookClient.feed.create({
      data: {
        type: "FARCASTER_FEED",
        hash,
        filter,
        creatorFid: "262426",
      },
    });

    return newFeed.id;
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

  hash(data: object): string {
    const json = JSON.stringify(data);
    const hash = createHash("md5").update(json).digest("hex");
    return hash;
  }
}
