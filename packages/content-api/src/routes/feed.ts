import { FastifyInstance } from "fastify";
import { FeedService } from "../service/feed";
import { FarcasterFeedRequest } from "@nook/common/types/feed";

export const feedRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new FeedService(fastify);

    fastify.post<{
      Body: FarcasterFeedRequest;
      Querystring: { cursor?: string };
    }>("/feed/content", async (request, reply) => {
      const response = await service.getContentFeed(request.body);
      reply.send(response);
    });
  });
};
