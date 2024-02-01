import { FastifyInstance } from "fastify";
import { FeedService } from "../services/feedService";
import { GetFeedRequest } from "../../types";

export const getFeeds = async (fastify: FastifyInstance) => {
  const feedService = new FeedService(fastify);

  fastify.post<{ Body: GetFeedRequest }>("/feeds", async (request, reply) => {
    const data = await feedService.getFeeds(request.body);
    return reply.send({ data });
  });
};
