import { FastifyInstance } from "fastify";
import { FeedService } from "../services/feedService";
import { GetContentFeedRequest } from "../../types";

export const getFeeds = async (fastify: FastifyInstance) => {
  const feedService = new FeedService(fastify);

  fastify.post<{ Body: GetContentFeedRequest }>(
    "/feeds",
    async (request, reply) => {
      const data = await feedService.getFeeds(request.body);
      return reply.send({ data });
    },
  );
};
