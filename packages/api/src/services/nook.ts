import { FastifyInstance } from "fastify";
import { Prisma, PrismaClient, Nook as DBNook } from "@nook/common/prisma/nook";
import { FarcasterAPIClient } from "@nook/common/clients";
import {
  CreateShelfInstance,
  Nook,
  NookShelf,
  Form,
  ShelfProtocol,
  ShelfRenderer,
  ShelfType,
  NookTemplate,
  CreateNook,
  NookTeamArgs,
  ChannelFilterType,
  Channel,
  NookFarcasterChannelArgs,
  NookShelfInstance,
  NookOnboardingArgs,
  NookMetadata,
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

    const shelves = await this.nookClient.shelfInstance.findMany({
      where: {
        deletedAt: null,
        nookId: {
          in: nooks.map((nook) => nook.id),
        },
      },
    });

    return {
      data: nooks.map((nook) => ({
        ...nook,
        shelves: shelves.filter((shelf) => shelf.nookId === nook.id),
      })),
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
    const user = await this.nookClient.user.findUnique({
      where: {
        fid,
      },
      select: {
        metadata: true,
      },
    });

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

    const sortedShelves = response.map((nook) => {
      const metadata = nook.metadata as NookMetadata | undefined;
      if (!metadata?.shelfOrder) return nook;
      return {
        ...nook,
        shelves: metadata.shelfOrder.map((shelfId) =>
          nook.shelves.find((shelf) => shelf.id === shelfId),
        ),
      };
    });

    const metadata = user?.metadata as { nookOrder: string[] } | undefined;
    if (metadata?.nookOrder) {
      return metadata.nookOrder.map((nookId) =>
        sortedShelves.find((nook) => nook.id === nookId),
      );
    }

    return sortedShelves;
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
      include: {
        shelves: {
          where: {
            deletedAt: null,
          },
        },
      },
    });
  }

  async createNook(fid: string, nookData: CreateNook) {
    switch (nookData.templateId) {
      case "onboarding": {
        const data = nookData.data as NookOnboardingArgs;
        return await this.nookClient.nook.create({
          data: {
            name: nookData.name,
            description: nookData.description,
            imageUrl: nookData.imageUrl,
            visibility: nookData.visibility,
            metadata: {},
            creatorFid: fid,
            members: {
              create: {
                fid: fid,
              },
            },
            shelves: {
              createMany: {
                skipDuplicates: true,
                data: data.shelves.map((shelf) => ({
                  shelfId: shelf.shelfId,
                  name: shelf.name,
                  creatorFid: fid,
                  description: shelf.description,
                  imageUrl: shelf.imageUrl,
                  data: shelf.data,
                  type: shelf.type,
                  renderer: shelf.renderer,
                })),
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
      }
      // Farcaster Channel
      case "a51a8c5f-4b37-4bf5-a4f5-6d5a9d266c09": {
        const data = nookData.data as NookFarcasterChannelArgs;
        return await this.nookClient.nook.create({
          data: {
            name: nookData.name,
            description: nookData.description,
            imageUrl: nookData.imageUrl,
            visibility: nookData.visibility,
            metadata: {},
            creatorFid: fid,
            members: {
              create: {
                fid: fid,
              },
            },
            shelves: {
              createMany: {
                skipDuplicates: true,
                data: [
                  {
                    shelfId: "1b1d8924-d10c-444d-aacd-e41873bca312",
                    name: "Posts",
                    description: "Newly posted in this channel",
                    creatorFid: fid,
                    type: ShelfType.FARCASTER_POSTS,
                    renderer: ShelfRenderer.POST_DEFAULT,
                    data: {
                      channels: data.channel,
                    },
                  },
                  {
                    shelfId: "5e255324-33ad-47a9-b76b-27bca844cc97",
                    name: "Media",
                    description: "Only images and videos",
                    creatorFid: fid,
                    type: ShelfType.FARCASTER_MEDIA,
                    renderer: ShelfRenderer.POST_MEDIA,
                    data: {
                      channels: data.channel,
                    },
                  },
                  {
                    shelfId: "6f0c5b0b-3144-41f3-8786-598be640d144",
                    name: "Frames",
                    description: "Only frames",
                    creatorFid: fid,
                    type: ShelfType.FARCASTER_FRAMES,
                    renderer: ShelfRenderer.POST_FRAMES,
                    data: {
                      channels: data.channel,
                    },
                  },
                ],
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
      }
      // Project / Team
      case "b8726fe8-f491-44ba-87a6-97564382bf40": {
        const data = nookData.data as NookTeamArgs;

        let channels: Channel[] = [];
        if (data.channels.type === ChannelFilterType.CHANNEL_IDS) {
          const response = await this.farcaster.getChannels(
            { channelIds: data.channels.data.channelIds },
            fid,
          );
          channels = response.data;
        } else if (data.channels.type === ChannelFilterType.CHANNEL_URLS) {
          const response = await this.farcaster.getChannels(
            { parentUrls: data.channels.data.urls },
            fid,
          );
          channels = response.data;
        }

        const shelves = [];

        shelves.push(
          {
            shelfId: "1b1d8924-d10c-444d-aacd-e41873bca312",
            name: "Team Posts",
            description: "Posts from the team",
            creatorFid: fid,
            type: ShelfType.FARCASTER_POSTS,
            renderer: ShelfRenderer.POST_DEFAULT,
            data: {
              users: data.users,
            },
          },
          {
            shelfId: "b7c3f089-daf0-49c3-912f-f2a9e4dab618",
            name: "Team",
            description: "List of team members",
            creatorFid: fid,
            type: ShelfType.FARCASTER_USERS,
            renderer: ShelfRenderer.USER_LIST,
            data: {
              users: data.users,
            },
          },
        );

        if (channels.length > 1) {
          shelves.push({
            shelfId: "1b1d8924-d10c-444d-aacd-e41873bca312",
            name: "Channel Posts",
            description: "Posts in our channel(s)",
            creatorFid: fid,
            type: ShelfType.FARCASTER_POSTS,
            renderer: ShelfRenderer.POST_DEFAULT,
            data: {
              channels: data.channels,
            },
          });
        }

        for (const channel of channels) {
          shelves.push({
            shelfId: "1b1d8924-d10c-444d-aacd-e41873bca312",
            name: channel.name,
            description: channel.description,
            creatorFid: fid,
            type: ShelfType.FARCASTER_POSTS,
            renderer: ShelfRenderer.POST_DEFAULT,
            data: {
              channels: {
                type: ChannelFilterType.CHANNEL_URLS,
                data: {
                  urls: [channel.url],
                },
              },
            },
          });
        }

        return await this.nookClient.nook.create({
          data: {
            name: nookData.name,
            description: nookData.description,
            imageUrl: nookData.imageUrl,
            visibility: nookData.visibility,
            metadata: {},
            creatorFid: fid,
            members: {
              create: {
                fid: fid,
              },
            },
            shelves: {
              createMany: {
                skipDuplicates: true,
                data: shelves,
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
      }
      default:
        return await this.nookClient.nook.create({
          data: {
            name: nookData.name,
            description: nookData.description,
            imageUrl: nookData.imageUrl,
            visibility: nookData.visibility,
            metadata: {},
            creatorFid: fid,
            members: {
              create: {
                fid: fid,
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
    }
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

    await this.nookClient.shelfInstance.updateMany({
      where: {
        nookId,
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

  async updateShelf(shelfId: string, instance: NookShelfInstance) {
    await this.nookClient.shelfInstance.update({
      where: {
        id: shelfId,
      },
      data: {
        name: instance.name,
        description: instance.description,
        imageUrl: instance.imageUrl,
        data: instance.data,
        type: instance.type,
        renderer: instance.renderer,
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
      form: shelf.form as Form,
    }));
  }

  async getNookTemplates(): Promise<NookTemplate[]> {
    const templates = await this.nookClient.nookTemplate.findMany({
      where: {
        enabled: true,
      },
    });

    return templates.map((template) => ({
      id: template.id,
      creatorFid: template.creatorFid,
      name: template.name,
      description: template.description || undefined,
      imageUrl: template.imageUrl || undefined,
      form: template.form as Form,
    }));
  }

  async reorderNooks(fid: string, nookIds: string[]) {
    await this.nookClient.user.update({
      where: {
        fid,
      },
      data: {
        metadata: {
          nookOrder: nookIds,
        },
      },
    });
  }

  async reorderShelves(nook: DBNook, shelfIds: string[]) {
    await this.nookClient.nook.update({
      where: {
        id: nook.id,
      },
      data: {
        metadata: {
          shelfOrder: shelfIds,
        },
      },
    });
  }
}
