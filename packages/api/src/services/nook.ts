import { FastifyInstance } from "fastify";
import { FarcasterAPIClient, NookCacheClient } from "@nook/common/clients";
import {
  PrismaClient,
  Nook as DBNook,
  NookShelf as DBNookShelf,
} from "@nook/common/prisma/nook";
import { Nook, NookShelf, NookShelfType } from "@nook/common/types";

export class NookService {
  private nookClient: PrismaClient;
  private nookCacheClient: NookCacheClient;

  constructor(fastify: FastifyInstance) {
    this.nookClient = fastify.nook.client;
    this.nookCacheClient = new NookCacheClient();
  }

  async getNooks(fid: string) {
    const memberships = await this.nookClient.nookMembership.findMany({
      where: {
        user: {
          fid,
        },
      },
    });

    const nooks = await Promise.all(
      memberships.map((membership) => this.getNook(membership.nookId)),
    );

    let homeNook = nooks.find((nook) => nook.type === "home");
    if (!homeNook) {
      homeNook = await this.createHomeNook(fid);
    }

    const otherNooks = nooks.filter((nook) => nook.type !== "home");

    return [homeNook, ...otherNooks];
  }

  async getNook(id: string): Promise<Nook> {
    const cached = await this.nookCacheClient.getNook(id);
    if (cached) {
      return cached;
    }

    const nook = await await this.nookClient.nook.findUnique({
      where: {
        id,
      },
      include: {
        shelves: true,
      },
    });
    if (!nook) {
      throw new Error(`Nook not found ${id}`);
    }

    const response = this.formatNook(nook);
    await this.nookCacheClient.setNook(id, response);
    return response;
  }

  async getShelf(id: string): Promise<NookShelf | undefined> {
    const shelf = await this.nookClient.nookShelf.findUnique({
      where: {
        id,
      },
    });
    if (!shelf) return;

    return this.formatShelf(shelf);
  }

  async createHomeNook(fid: string): Promise<Nook> {
    const nook = await this.nookClient.nook.create({
      data: {
        type: "home",
        name: "Home",
        description: "Your personally-curated nook",
        imageUrl:
          "https://upload.wikimedia.org/wikipedia/commons/3/34/Home-icon.svg",
        creatorFid: fid,
        shelves: {
          createMany: {
            data: [
              {
                name: "You",
                description: "Your profile",
                type: NookShelfType.FarcasterProfile,
                args: {
                  fid,
                },
              },
              {
                name: "Following",
                description: "From people you follow",
                type: NookShelfType.FeedFarcasterFollowing,
                args: {
                  fid,
                },
              },
              {
                name: "Discover",
                description: "From people you should follow",
                type: NookShelfType.FeedFarcasterFollowing,
                args: {
                  fid,
                },
              },
            ],
          },
        },
      },
      include: {
        shelves: true,
      },
    });

    await this.nookClient.nookMembership.create({
      data: {
        nookId: nook.id,
        fid,
      },
    });

    const response = this.formatNook(nook);
    await this.nookCacheClient.setNook(nook.id, response);
    return response;
  }

  formatNook(nook: DBNook & { shelves: DBNookShelf[] }): Nook {
    return {
      id: nook.id,
      type: nook.type,
      name: nook.name,
      description: nook.description,
      imageUrl: nook.imageUrl,
      creatorFid: nook.creatorFid,
      shelves: nook.shelves.map(this.formatShelf),
      createdAt: nook.createdAt.getTime(),
      updatedAt: nook.updatedAt.getTime(),
    };
  }

  formatShelf(shelf: DBNookShelf): NookShelf {
    return {
      id: shelf.id,
      name: shelf.name,
      description: shelf.description,
      type: shelf.type as NookShelfType,
      args: shelf.args as unknown as NookShelf["args"],
    };
  }
}
