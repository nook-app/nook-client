import { PrismaClient } from "@nook/common/prisma/notifications";
import { FastifyInstance } from "fastify";

export const MAX_PAGE_SIZE = 25;

export class UserService {
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
}
