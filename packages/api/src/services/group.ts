import { PrismaClient } from "@nook/common/prisma/nook";
import { CreateNookRequest, Panel, UserMetadata } from "@nook/common/types";
import { FastifyInstance } from "fastify";

export class GroupService {
  private client: PrismaClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.nook.client;
  }

  async getOrCreatePanels(panels: Panel[]) {
    const created = await Promise.all(
      panels
        .filter((p) => !p.id)
        .map((p) =>
          this.client.panel.upsert({
            where: {
              type_key: {
                type: p.type,
                key: p.key,
              },
            },
            create: {
              name: p.name,
              type: p.type,
              key: p.key,
              display: p.display,
            },
            update: {
              name: p.name,
              type: p.type,
              key: p.key,
              display: p.display,
            },
          }),
        ),
    );

    const createdMap = created.reduce(
      (acc, p) => {
        acc[`${p.type}_${p.key}`] = p as Panel;
        return acc;
      },
      {} as Record<string, Panel>,
    );

    return panels.map((p) => createdMap[`${p.type}_${p.key}`] || p);
  }

  async createGroup(fid: string, req: CreateNookRequest) {
    const panels = await this.getOrCreatePanels(req.panels);
    const result = await this.client.userPanelGroup.create({
      data: {
        fid,
        name: req.name,
        icon: req.icon,
        type: "custom",
        panels: {
          connectOrCreate: panels.map((p) => ({
            where: {
              fid_panelId: {
                fid,
                panelId: p.id,
              },
            },
            create: {
              fid,
              panelId: p.id,
            },
          })),
        },
      },
      include: {
        panels: {
          include: {
            panel: true,
          },
        },
      },
    });

    return {
      ...result,
      panels: result.panels.map((p) => p.panel),
    };
  }

  async updateGroup(fid: string, groupId: string, req: CreateNookRequest) {
    const panels = await this.getOrCreatePanels(req.panels);
    await this.client.userPanel.deleteMany({
      where: {
        groupId,
        panelId: {
          notIn: panels.map((p) => p.id),
        },
      },
    });

    await this.client.userPanel.createMany({
      data: panels.map((p) => ({
        fid,
        panelId: p.id,
        groupId,
      })),
      skipDuplicates: true,
    });

    const result = await this.client.userPanelGroup.update({
      where: {
        id: groupId,
      },
      data: {
        name: req.name,
        icon: req.icon,
      },
      include: {
        panels: {
          include: {
            panel: true,
          },
        },
      },
    });

    const user = await this.client.user.findFirst({
      where: {
        fid,
      },
    });
    if (user) {
      const metadata = user.metadata as UserMetadata | undefined;
      if (metadata?.order) {
        await this.client.user.update({
          where: {
            fid,
          },
          data: {
            metadata: {
              ...metadata,
              order: metadata.order.map((g) =>
                g[0] === groupId ? [g[0], panels.map((p) => p.id)] : g,
              ),
            },
          },
        });
      }
    }

    return {
      ...result,
      panels: result.panels.map((p) => p.panel),
    };
  }

  async deleteGroup(groupId: string) {
    return await this.client.userPanelGroup.updateMany({
      where: {
        id: groupId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getGroups(fid: string) {
    return await this.client.userPanelGroup.findMany({
      where: {
        fid,
        deletedAt: null,
      },
    });
  }

  async getGroup(groupId: string) {
    return await this.client.userPanelGroup.findFirst({
      where: {
        id: groupId,
      },
    });
  }
}
