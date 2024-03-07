import { FastifyInstance } from "fastify";
import { FarcasterAPIClient, NookCacheClient } from "@nook/common/clients";
import { PrismaClient } from "@nook/common/prisma/nook";
import { Nook, NookShelf } from "@nook/common/types";

export class NookService {
  private nookClient: PrismaClient;
  private nookCacheClient: NookCacheClient;
  private farcasterClient: FarcasterAPIClient;

  constructor(fastify: FastifyInstance) {
    this.nookClient = fastify.nook.client;
    this.farcasterClient = new FarcasterAPIClient();
    this.nookCacheClient = new NookCacheClient();
  }

  async getNooksByUser(fid: string) {
    const memberships = await this.nookClient.nookMembership.findMany({
      where: {
        user: {
          fid,
        },
      },
    });

    return await Promise.all(
      memberships.map((membership) => this.getNook(membership.nookId)),
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

    const creator = await this.farcasterClient.getUser(nook.creatorFid);

    const response: Nook = {
      id: nook.id,
      name: nook.name,
      description: nook.description,
      imageUrl: nook.imageUrl,
      creator: creator,
      shelves: nook.shelves as unknown as NookShelf[],
      createdAt: nook.createdAt.getTime(),
      updatedAt: nook.updatedAt.getTime(),
    };

    await this.nookCacheClient.setNook(id, response);

    return response;
  }
}
