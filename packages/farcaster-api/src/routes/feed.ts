import { FastifyInstance } from "fastify";
import { FarcasterPostArgs, ShelfDataRequest } from "@nook/common/types";
import { FeedService } from "../service/feed";
import { FarcasterService } from "../service/farcaster";

export const feedRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new FeedService(fastify);
    const farcasterService = new FarcasterService(fastify);

    fastify.post<{
      Body: ShelfDataRequest<FarcasterPostArgs>;
      Querystring: { cursor?: string };
    }>("/feed/posts/new", async (request, reply) => {
      const response = await service.getNewPosts(request.body);
      const casts = await farcasterService.getCastsFromHashes(
        response.data,
        request.body.context.viewerFid,
      );
      reply.send({
        data: casts,
        nextCursor: response.nextCursor,
      });
    });
  });
};
