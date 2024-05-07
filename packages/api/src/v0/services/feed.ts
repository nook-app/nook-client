import { PrismaClient } from "@nook/common/prisma/nook";
import { CreateFeedRequest } from "@nook/common/types/feed";
import { FastifyInstance } from "fastify";

export class FeedService {
  private client: PrismaClient;

  constructor(fastify: FastifyInstance) {
    this.client = fastify.nook.client;
  }

  async createFeed(fid: string, req: CreateFeedRequest) {
    return await this.client.feed.create({
      data: {
        fid,
        name: req.name,
        filter: req.filter,
        icon: req.icon,
        type: req.type,
        api: req.api,
        display: req.display,
      },
    });
  }

  async updateFeed(feedId: string, req: CreateFeedRequest) {
    return await this.client.feed.update({
      where: {
        id: feedId,
      },
      data: {
        name: req.name,
        filter: req.filter,
        icon: req.icon,
        type: req.type,
        api: req.api,
        display: req.display,
      },
    });
  }

  async deleteFeed(feedId: string) {
    return await this.client.feed.updateMany({
      where: {
        id: feedId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getFeeds(fid: string) {
    return await this.client.feed.findMany({
      where: {
        fid,
        deletedAt: null,
      },
    });
  }

  async getFeed(feedId: string) {
    return await this.client.feed.findFirst({
      where: {
        id: feedId,
      },
    });
  }
}
