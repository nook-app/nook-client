import { FastifyInstance } from "fastify";
import { FeedService } from "../service/feed";
import { FarcasterService } from "../service/farcaster";
import { FarcasterFeedRequest } from "@nook/common/types/feed";
import { encodeCursor } from "@nook/common/utils";
import { ContentAPIClient } from "@nook/common/clients";

const MAX_PAGE_SIZE = 25;

export const feedRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new FeedService(fastify);
    const farcasterService = new FarcasterService(fastify);
    const contentApi = new ContentAPIClient();

    fastify.post<{
      Body: FarcasterFeedRequest;
    }>("/feed/casts", async (request, reply) => {
      try {
        const { onlyFrames, contentTypes, embeds } = request.body.filter;

        if (
          onlyFrames ||
          (contentTypes && contentTypes.length > 0) ||
          (embeds && embeds.length > 0)
        ) {
          const response = await contentApi.getContentFeed(request.body);
          const casts = await farcasterService.getCastsFromHashes(
            response.data,
            request.body.context?.viewerFid,
          );
          return reply.send({
            data: casts,
            nextCursor: response.nextCursor,
          });
        }

        const response = await service.getCastFeed(request.body);
        const casts = await farcasterService.getCastsFromData(
          response.data,
          request.body.context?.viewerFid,
        );

        return reply.send({
          data: casts,
          nextCursor: response.nextCursor,
        });
      } catch (e) {
        console.error(e);
        reply.send({
          data: [],
        });
      }
    });

    fastify.post<{
      Body: FarcasterFeedRequest;
    }>("/feed", async (request, reply) => {
      try {
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

        reply.send({
          data: sortedCasts,
          nextCursor:
            sortedCasts.length === MAX_PAGE_SIZE
              ? encodeCursor({
                  timestamp: sortedCasts[sortedCasts.length - 1]?.timestamp,
                })
              : undefined,
        });
      } catch (e) {
        console.error(e);
        reply.send({
          data: [],
        });
      }
    });
  });
};
