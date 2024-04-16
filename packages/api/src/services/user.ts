import { FastifyInstance } from "fastify";
import {
  AppClient as FarcasterAuthClient,
  createAppClient,
  viemConnector,
} from "@farcaster/auth-client";
import { SignInWithFarcasterRequest, TokenResponse } from "../../types";
import { PrismaClient } from "@nook/common/prisma/nook";
import { UserMetadata } from "@nook/common/types";

const DEV_USER_FID = 20716;

const DEFAULT_NOOKS = [
  {
    name: "Home",
    icon: "home",
    panels: ["following", "trending", "latest"],
  },
  {
    name: "Frames",
    icon: "square-mouse-pointer",
    panels: ["frames-following", "frames-latest"],
  },
  {
    name: "Media",
    icon: "image",
    panels: ["media-following", "media-latest", "videos-latest"],
  },
];
export class UserService {
  private farcasterAuthClient: FarcasterAuthClient;
  private jwt: FastifyInstance["jwt"];
  private nookClient: PrismaClient;

  constructor(fastify: FastifyInstance) {
    this.jwt = fastify.jwt;
    this.farcasterAuthClient = createAppClient({
      ethereum: viemConnector(),
    });
    this.nookClient = fastify.nook.client;
  }

  async signInWithDev(): Promise<TokenResponse | undefined> {
    const user = await this.nookClient.user.findFirst({
      where: {
        fid: DEV_USER_FID.toString(),
      },
    });

    if (!user?.siwfData) return;

    return await this.signInWithFarcaster(
      user.siwfData as SignInWithFarcasterRequest,
    );
  }

  async refreshUser(data: {
    fid: string;
    token: string;
    refreshToken: string;
    expiresAt: number;
    theme?: string;
  }): Promise<TokenResponse | undefined> {
    let user = await this.nookClient.user.findFirst({
      where: {
        fid: data.fid,
      },
    });

    const isNewUser = !user;
    if (!user) {
      user = await this.nookClient.user.create({
        data: {
          fid: data.fid,
          refreshToken: data.refreshToken,
          theme: data.theme,
          signedUpAt: new Date(),
          loggedInAt: new Date(),
          siwfData: {},
          metadata: {
            actionBar: ["reply", "recast", "like"],
          },
        },
      });
    } else {
      user = await this.nookClient.user.update({
        where: {
          fid: data.fid,
        },
        data: {
          fid: data.fid,
          refreshToken: data.refreshToken,
          theme: data.theme,
          loggedInAt: new Date(),
        },
      });
    }

    const expiresIn = 60 * 60 * 24 * 7;
    const expiresAt = Math.floor(new Date().getTime() / 1000) + expiresIn;
    const token = this.jwt.sign(
      {
        fid: user.fid,
      },
      { expiresIn },
    );

    return {
      fid: user.fid,
      refreshToken: user.refreshToken,
      token,
      expiresAt,
      theme: user.theme,
      isNewUser,
    };
  }

  async signInWithFarcaster(
    request: SignInWithFarcasterRequest,
  ): Promise<TokenResponse | undefined> {
    const verifyResult = await this.farcasterAuthClient.verifySignInMessage({
      domain: process.env.SIWF_DOMAIN || "localhost:3000",
      ...request,
    });

    if (verifyResult.isError) {
      throw new Error(verifyResult.error?.message || "Sign in failed");
    }

    const fid = verifyResult.fid.toString();
    const refreshToken = this.jwt.sign({
      fid,
    });

    const date = new Date();

    let user = await this.nookClient.user.findFirst({
      where: {
        fid,
      },
    });

    const isNewUser = !user;
    if (!user) {
      user = await this.nookClient.user.create({
        data: {
          fid,
          signedUpAt: date,
          loggedInAt: date,
          refreshToken,
          siwfData: request,
          metadata: {
            actionBar: ["reply", "recast", "like"],
          },
        },
      });
    } else {
      user = await this.nookClient.user.update({
        where: {
          fid,
        },
        data: {
          loggedInAt: date,
          refreshToken,
          siwfData: request,
        },
      });
    }

    const expiresIn = 60 * 60 * 24 * 7;
    const expiresAt = Math.floor(new Date().getTime() / 1000) + expiresIn;
    const token = this.jwt.sign(
      {
        fid,
      },
      { expiresIn },
    );

    return {
      fid,
      token,
      refreshToken: user.refreshToken,
      expiresAt,
      theme: user.theme,
      isNewUser,
    };
  }

  async getToken(refreshToken: string): Promise<TokenResponse | undefined> {
    const { fid } = this.jwt.verify(refreshToken) as { fid: string };
    const user = await this.nookClient.user.findFirst({
      where: {
        fid,
      },
    });
    if (!user) {
      return;
    }

    if (user.refreshToken !== refreshToken) {
      throw new Error("Invalid refresh token");
    }

    const expiresIn = 60 * 60 * 24 * 7;
    const expiresAt = Math.floor(new Date().getTime() / 1000) + expiresIn;
    const token = this.jwt.sign(
      {
        fid: user.fid,
      },
      { expiresIn },
    );

    return {
      fid,
      refreshToken,
      token,
      expiresAt,
      theme: user.theme,
    };
  }

  async getUser(fid: string) {
    const user = await this.nookClient.user.findFirst({
      where: {
        fid,
      },
      include: {
        mutedUsers: true,
        mutedParentUrls: true,
        mutedWords: true,
        feeds: {
          where: {
            deletedAt: null,
          },
        },
        groups: {
          where: {
            deletedAt: null,
          },
          include: {
            panels: {
              include: {
                panel: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return;
    }

    const missingHomeNook = !user.groups.find(
      (g) => g.name === "Home" && g.type === "default",
    );

    const missingNooks = missingHomeNook
      ? DEFAULT_NOOKS.filter(({ name }) =>
          user.groups.every((g) => g.name !== name),
        )
      : [];

    if (missingNooks.length > 0) {
      const defaultPanels = await this.nookClient.panel.findMany({
        where: {
          type: "default",
        },
      });

      const groups = await Promise.all(
        missingNooks.map((nook) =>
          this.nookClient.userPanelGroup.create({
            data: {
              name: nook.name,
              icon: nook.icon,
              type: "default",
              user: {
                connect: {
                  fid,
                },
              },
              panels: {
                connectOrCreate: defaultPanels
                  .filter((panel) => nook.panels.includes(panel.key))
                  .map((panel) => ({
                    where: {
                      fid_panelId: {
                        fid,
                        panelId: panel.id,
                      },
                    },
                    create: {
                      fid,
                      panelId: panel.id,
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
          }),
        ),
      );

      user.groups = [...user.groups, ...groups];
    }

    let formattedNooks = user.groups.map((g) => ({
      ...g,
      panels: g.panels.map((p) => p.panel),
    }));

    const metadata = user.metadata as UserMetadata | undefined;

    if (metadata?.order && metadata.order.length > 0) {
      const newOrderedNooks: typeof formattedNooks = [];
      for (const [groupId, panelIds] of metadata.order) {
        const group = formattedNooks.find((g) => g.id === groupId);
        if (group) {
          const newPanels: typeof group.panels = [];
          for (const panelId of panelIds) {
            const panel = group.panels.find((p) => p.id === panelId);
            if (panel) {
              newPanels.push(panel);
            }
          }
          newOrderedNooks.push({
            ...group,
            panels: newPanels,
          });
        }
      }

      for (const group of formattedNooks.filter(
        (g) => !newOrderedNooks.some((n) => n.id === g.id),
      )) {
        newOrderedNooks.push(group);
      }

      formattedNooks = newOrderedNooks;
    } else {
      const newOrderedNooks: typeof formattedNooks = [];
      for (const nook of DEFAULT_NOOKS) {
        const group = formattedNooks.find((g) => g.name === nook.name);
        if (group) {
          newOrderedNooks.push(group);
        }
      }

      for (const group of formattedNooks.filter(
        (g) => !DEFAULT_NOOKS.some((n) => n.name === g.name),
      )) {
        newOrderedNooks.push(group);
      }

      await this.nookClient.user.update({
        where: {
          fid,
        },
        data: {
          metadata: {
            ...metadata,
            order: newOrderedNooks.map((g) => [
              g.id,
              g.panels.map((p) => p.id),
            ]),
          },
        },
      });
      formattedNooks = newOrderedNooks;
    }

    return {
      ...user,
      nooks: formattedNooks,
      mutedUsers: user.mutedUsers.map((m) => m.mutedFid),
      mutedChannels: user.mutedParentUrls.map((m) => m.mutedParentUrl),
      mutedWords: user.mutedWords.map((m) => m.mutedWord),
      siwfData: undefined,
      refreshToken: undefined,
    };
  }

  async updateUser(fid: string, data: { theme: string }) {
    const user = await this.nookClient.user.update({
      where: {
        fid,
      },
      data,
    });

    if (!user) {
      return;
    }

    return {
      fid: user.fid,
      signedUpAt: user.signedUpAt,
      loggedInAt: user.loggedInAt,
      theme: user.theme,
    };
  }

  async updateMetadata(fid: string, metadata: UserMetadata) {
    const user = await this.nookClient.user.findFirst({
      where: {
        fid,
      },
    });

    if (!user) {
      return;
    }

    const existingMetadata = user.metadata as UserMetadata | undefined;

    await this.nookClient.user.update({
      where: {
        fid,
      },
      data: {
        metadata: {
          ...existingMetadata,
          ...metadata,
        },
      },
    });
  }
}
