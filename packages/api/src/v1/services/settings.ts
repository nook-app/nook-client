import { NookCacheClient } from "@nook/common/clients";
import { CastActionV1Request, CastActionV2Request } from "@nook/common/types";
import { FastifyInstance } from "fastify";

export class SettingsService {
  private client;
  private cache;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.nook.client;
    this.cache = new NookCacheClient(fastify.redis.client);
  }

  async getSettings(fid: string) {
    const settings = await this.client.user.findFirst({
      where: {
        fid,
      },
      select: {
        theme: true,
        mutedUsers: true,
        mutedParentUrls: true,
        mutedWords: true,
        actions: {
          include: {
            action: true,
          },
        },
      },
    });

    if (!settings) {
      return;
    }

    return {
      ...settings,
      actions: settings.actions.sort((a, b) => a.index - b.index),
      mutedUsers: settings.mutedUsers.map((m) => m.mutedFid),
      mutedChannels: settings.mutedParentUrls.map((m) => m.mutedParentUrl),
      mutedWords: settings.mutedWords.map((m) => m.mutedWord),
    };
  }

  async updateTheme(fid: string, theme: string) {
    await this.client.user.update({
      where: {
        fid,
      },
      data: {
        theme,
      },
    });
  }

  async muteUser(fid: string, mutedFid: string) {
    await this.client.userMutedUser.upsert({
      where: {
        fid_mutedFid: {
          mutedFid,
          fid,
        },
      },
      create: {
        mutedFid,
        fid,
      },
      update: {},
    });

    await this.cache.addUserMute(fid, `user:${mutedFid}`);
  }

  async unmuteUser(fid: string, mutedFid: string) {
    await this.client.userMutedUser.delete({
      where: {
        fid_mutedFid: {
          mutedFid,
          fid,
        },
      },
    });
    await this.cache.removeUserMute(fid, `user:${mutedFid}`);
  }

  async muteChannel(fid: string, mutedParentUrl: string) {
    await this.client.userMutedParentUrl.upsert({
      where: {
        fid_mutedParentUrl: {
          mutedParentUrl,
          fid,
        },
      },
      create: {
        mutedParentUrl,
        fid,
      },
      update: {},
    });
    await this.cache.addUserMute(fid, `channel:${mutedParentUrl}`);
  }

  async unmuteChannel(fid: string, mutedParentUrl: string) {
    await this.client.userMutedParentUrl.delete({
      where: {
        fid_mutedParentUrl: {
          mutedParentUrl,
          fid,
        },
      },
    });
    await this.cache.removeUserMute(fid, `channel:${mutedParentUrl}`);
  }

  async muteWord(fid: string, mutedWord: string) {
    await this.client.userMutedWord.upsert({
      where: {
        fid_mutedWord: {
          mutedWord,
          fid,
        },
      },
      create: {
        mutedWord,
        fid,
      },
      update: {},
    });
    await this.cache.addUserMute(fid, `word:${mutedWord}`);
  }

  async unmuteWord(fid: string, mutedWord: string) {
    await this.client.userMutedWord.delete({
      where: {
        fid_mutedWord: {
          mutedWord,
          fid,
        },
      },
    });
    await this.cache.removeUserMute(fid, `word:${mutedWord}`);
  }

  async deleteAction(fid: string, index: number) {
    await this.client.userCastAction.delete({
      where: {
        fid_index: {
          fid,
          index,
        },
      },
    });
  }

  async setV1Action(fid: string, index: number, request: CastActionV1Request) {
    let action = await this.client.castAction.findUnique({
      where: {
        actionType_postUrl: {
          actionType: request.actionType,
          postUrl: request.postUrl,
        },
      },
    });

    if (!action) {
      action = await this.client.castAction.create({
        data: request,
      });
    }

    await this.client.userCastAction.upsert({
      where: {
        fid_index: {
          fid,
          index,
        },
      },
      update: {
        actionId: action.id,
      },
      create: {
        fid,
        index,
        actionId: action.id,
      },
    });
  }

  async setV2Action(fid: string, index: number, request: CastActionV2Request) {
    let action = await this.client.castAction.findFirst({
      where: {
        postUrl: request.url,
      },
    });

    if (!action) {
      try {
        const response = await fetch(request.url);
        const {
          name,
          icon,
          description,
          aboutUrl,
          action: { type },
        } = await response.json();

        action = await this.client.castAction.create({
          data: {
            postUrl: request.url,
            name,
            icon,
            description,
            aboutUrl,
            actionType: type,
          },
        });
      } catch (e) {
        return;
      }
    }

    await this.client.userCastAction.upsert({
      where: {
        fid_index: {
          fid,
          index,
        },
      },
      update: {
        actionId: action.id,
      },
      create: {
        fid,
        index,
        actionId: action.id,
      },
    });
  }
}
