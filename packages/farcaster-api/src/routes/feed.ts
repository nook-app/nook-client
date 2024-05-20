import { FastifyInstance } from "fastify";
import { FeedService } from "../service/feed";
import { FarcasterService } from "../service/farcaster";
import { FarcasterFeedRequest } from "@nook/common/types/feed";
import { encodeCursor } from "@nook/common/utils";

const MAX_PAGE_SIZE = 25;

export const feedRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new FeedService(fastify);
    const farcasterService = new FarcasterService(fastify);

    fastify.post<{
      Body: FarcasterFeedRequest;
      Querystring: { cursor?: string };
    }>("/feed/casts", async (request, reply) => {
      const response = await service.getCastFeed(request.body);
      const casts = await farcasterService.getCastsFromData(
        response.data,
        request.body.context?.viewerFid,
      );
      reply.send({
        data: casts,
        nextCursor: response.nextCursor,
      });
    });

    fastify.post<{
      Body: FarcasterFeedRequest;
      Querystring: { cursor?: string };
    }>("/feed", async (request, reply) => {
      const { newCasts, currentCasts, oldCasts } = await service.getFeed(
        request.body,
      );

      const casts = await farcasterService.getCastsFromData(
        newCasts.concat(oldCasts),
        request.body.context?.viewerFid,
        currentCasts,
      );

      const sortedCasts = casts
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_PAGE_SIZE);

      const cursor =
        sortedCasts.length > 0
          ? Math.min(...sortedCasts.map((cast) => cast.timestamp))?.toString()
          : undefined;

      reply.send({
        data: sortedCasts,
        cursor: cursor
          ? encodeCursor({
              timestamp: cursor,
            })
          : undefined,
      });
    });
  });
};
