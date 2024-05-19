import { FastifyInstance } from "fastify";
import { FeedService } from "../service/feed";
import { FarcasterService } from "../service/farcaster";
import { FarcasterFeedRequest } from "@nook/common/types/feed";

export const feedRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new FeedService(fastify);
    const farcasterService = new FarcasterService(fastify);

    fastify.post<{
      Body: FarcasterFeedRequest;
      Querystring: { cursor?: string };
    }>("/feed/casts", async (request, reply) => {
      console.time("getCastFeed");
      const response = await service.getCastFeed(request.body);
      console.timeEnd("getCastFeed");
      console.time("getCastsFromData");
      const casts = await farcasterService.getCastsFromData(
        response.data,
        request.body.context?.viewerFid,
      );
      console.timeEnd("getCastsFromData");
      reply.send({
        data: casts,
        nextCursor: response.nextCursor,
      });
    });
  });
};
