import { PrismaClient } from "@nook/common/prisma/notifications";
import { ShelfNotification } from "@nook/common/types";
import { FastifyInstance } from "fastify";

export const MAX_PAGE_SIZE = 25;

export class ShelfNotificationsService {
  private client: PrismaClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.notifications.client;
  }

  async subscribeToShelfNotifications(
    fid: string,
    shelfId: string,
  ): Promise<void> {
    await this.client.shelfNotificationSubscription.create({
      data: {
        fid,
        shelfId,
      },
    });
  }

  async unsubscribeFromShelfNotifications(
    fid: string,
    shelfId: string,
  ): Promise<void> {
    await this.client.shelfNotificationSubscription.delete({
      where: {
        shelfId_fid: {
          shelfId,
          fid,
        },
      },
    });
  }

  async deleteShelfNotificationData(shelfId: string) {
    await this.client.shelfNotification.delete({
      where: {
        shelfId,
      },
    });
  }

  async upsertShelfNotificationData(
    shelfId: string,
    instance: ShelfNotification,
  ) {
    let shelfNotification = await this.client.shelfNotification.findUnique({
      where: {
        shelfId,
      },
      include: {
        users: true,
        parentUrls: true,
        keywords: true,
        embedUrls: true,
        mutedKeywords: true,
      },
    });

    let users: { fid: string }[] = [];
    let parentUrls: { url: string }[] = [];
    let keywords: { keyword: string }[] = [];
    let embedUrls: { url: string }[] = [];
    let mutedKeywords: { keyword: string }[] = [];

    if (instance.users) {
      users = instance.users.map((user) => ({
        fid: user,
      }));
    }

    if (instance.parentUrls) {
      parentUrls = instance.parentUrls.map((url) => ({
        url,
      }));
    }

    if (instance.keywords) {
      keywords = instance.keywords.map((keyword) => ({
        keyword: keyword.toLowerCase(),
      }));
    }

    if (instance.embedUrls) {
      embedUrls = instance.embedUrls.map((url) => ({
        url,
      }));
    }

    if (instance.mutedKeywords) {
      mutedKeywords = instance.mutedKeywords.map((keyword) => ({
        keyword: keyword.toLowerCase(),
      }));
    }

    if (!shelfNotification) {
      shelfNotification = await this.client.shelfNotification.create({
        data: {
          shelfId,
          users: {
            create: users,
          },
          parentUrls: {
            create: parentUrls,
          },
          keywords: {
            create: keywords,
          },
          embedUrls: {
            create: embedUrls,
          },
          mutedKeywords: {
            create: mutedKeywords,
          },
          includeReplies: instance.includeReplies,
          onlyReplies: instance.onlyReplies,
        },
        include: {
          users: true,
          parentUrls: true,
          keywords: true,
          embedUrls: true,
          mutedKeywords: true,
        },
      });
      return;
    }

    // TODO: Optimize this later
    await Promise.all([
      this.client.shelfNotificationUserTopic.deleteMany({
        where: {
          shelfId,
        },
      }),
      this.client.shelfNotificationParentUrlTopic.deleteMany({
        where: {
          shelfId,
        },
      }),
      this.client.shelfNotificationKeywordTopic.deleteMany({
        where: {
          shelfId,
        },
      }),
      this.client.shelfNotificationEmbedUrlTopic.deleteMany({
        where: {
          shelfId,
        },
      }),
      this.client.shelfNotificationMutedKeywordTopic.deleteMany({
        where: {
          shelfId,
        },
      }),
    ]);

    await Promise.all([
      this.client.shelfNotificationUserTopic.createMany({
        data: users.map((user) => ({
          shelfId,
          fid: user.fid,
        })),
      }),
      this.client.shelfNotificationParentUrlTopic.createMany({
        data: parentUrls.map((url) => ({
          shelfId,
          url: url.url,
        })),
      }),
      this.client.shelfNotificationKeywordTopic.createMany({
        data: keywords.map((keyword) => ({
          shelfId,
          keyword: keyword.keyword,
        })),
      }),
      this.client.shelfNotificationEmbedUrlTopic.createMany({
        data: embedUrls.map((url) => ({
          shelfId,
          url: url.url,
        })),
      }),
      this.client.shelfNotificationMutedKeywordTopic.createMany({
        data: mutedKeywords.map((keyword) => ({
          shelfId,
          keyword: keyword.keyword,
        })),
      }),
    ]);
  }
}
