import { FastifyInstance } from "fastify";
import {
  PrismaClient,
  Nook as DBNook,
  NookShelf as DBNookShelf,
} from "@nook/common/prisma/nook";
import { Nook, NookShelf, NookShelfType } from "@nook/common/types";

export class NookService {
  private nookClient: PrismaClient;

  constructor(fastify: FastifyInstance) {
    this.nookClient = fastify.nook.client;
  }

  async getNooks(fid: string) {
    const memberships = await this.nookClient.nookMembership.findMany({
      where: {
        user: {
          fid,
        },
      },
    });

    const nooks = await this.nookClient.nook.findMany({
      where: {
        id: {
          in: memberships.map((membership) => membership.nookId),
        },
      },
      include: {
        shelves: true,
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
