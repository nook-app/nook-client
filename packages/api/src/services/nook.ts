import { FastifyInstance } from "fastify";
import { NookCacheClient } from "@nook/common/clients";
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
    this.nookCacheClient = new NookCacheClient(fastify.redis.client);
  }

  async getNooks(fid: string) {
    const memberships = await this.nookClient.nookMembership.findMany({
      where: {
        user: {
          fid,
        },
      },
    });

    const defaultNooks = await this.nookClient.nook.findMany({
      where: {
        creatorFid: "262426",
      },
      include: {
        shelves: true,
      },
    });

    const nooks = await Promise.all(
      memberships.map((membership) => this.getNook(membership.nookId)),
    );

    const missingDefaultNooks = defaultNooks.filter(
      (defaultNook) => !nooks.find((nook) => nook.id === defaultNook.id),
    );

    await Promise.all(
      missingDefaultNooks.map((nook) =>
        this.nookClient.nookMembership.create({
          data: {
            user: {
              connect: {
                fid,
              },
            },
            nook: {
              connect: {
                id: nook.id,
              },
            },
          },
        }),
      ),
    );

    return [...nooks, ...missingDefaultNooks.map(this.formatNook)].sort(
      (a, b) => {
        if (a.creatorFid === "262426" && b.creatorFid !== "262426") {
          return -1;
        }
        if (a.creatorFid !== "262426" && b.creatorFid === "262426") {
          return 1;
        }
        return 0;
      },
    );
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

  formatNook(nook: DBNook & { shelves: DBNookShelf[] }): Nook {
    return {
      id: nook.id,
      name: nook.name,
      description: nook.description,
      imageUrl: nook.imageUrl,
      creatorFid: nook.creatorFid,
      shelves: nook.shelves.map(this.formatShelf),
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
