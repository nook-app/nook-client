import { Prisma, PrismaClient } from "@nook/common/prisma/notifications";
import { GetNotificationsRequest, Notification } from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { decodeCursorTimestamp, encodeCursor } from "@nook/common/utils";
export const MAX_PAGE_SIZE = 50;

export class NotificationsService {
  private client: PrismaClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.notifications.client;
  }

  async getNotificationUser(fid: string) {
    return await this.client.user.findUnique({
      where: {
        fid,
      },
    });
  }

  async deleteNotificationUser(fid: string) {
    await this.client.user.updateMany({
      where: {
        fid,
      },
      data: {
        disabled: true,
      },
    });
  }

  async createNotificationUser(fid: string, token: string) {
    await this.client.user.upsert({
      where: {
        fid,
      },
      update: {
        token,
        disabled: false,
      },
      create: {
        fid,
        token,
      },
    });
  }

  async publishNotification(notification: Notification) {
    await this.client.notification.upsert({
      where: {
        fid_service_type_sourceId: {
          fid: notification.fid,
          service: notification.service,
          type: notification.type,
          sourceId: notification.sourceId,
        },
      },
      create: {
        ...notification,
        data: notification.data || Prisma.DbNull,
      },
      update: {
        ...notification,
        data: notification.data || Prisma.DbNull,
      },
    });
  }

  async deleteNotification(notification: Notification) {
    await this.client.notification.updateMany({
      where: {
        fid: notification.fid,
        service: notification.service,
        type: notification.type,
        sourceId: notification.sourceId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getNotifications(req: GetNotificationsRequest, cursor?: string) {
    const data = await this.client.notification.findMany({
      where: {
        fid: req.fid,
        type: req.types
          ? {
              in: req.types,
            }
          : undefined,
        timestamp: decodeCursorTimestamp(cursor),
        deletedAt: null,
      },
      orderBy: {
        timestamp: "desc",
      },
      take: MAX_PAGE_SIZE,
    });

    return {
      data,
      nextCursor:
        data.length === MAX_PAGE_SIZE
          ? encodeCursor({
              timestamp: data[data.length - 1]?.timestamp.getTime(),
            })
          : undefined,
    };
  }

  async getUnreadNotifications(fid: string) {
    return await this.client.notification.count({
      where: {
        fid,
        read: false,
      },
    });
  }

  async markNotificationsRead(fid: string) {
    await this.client.notification.updateMany({
      where: {
        fid,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }
}
