import { FastifyInstance } from "fastify";
import {
  FarcasterEmbedArgs,
  FarcasterFrameArgs,
  FarcasterMediaArgs,
  FarcasterPostArgs,
  ShelfDataRequest,
} from "@nook/common/types";
import { FeedService } from "../service/feed";

export const feedRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new FeedService(fastify);

    fastify.post<{
      Body: ShelfDataRequest<FarcasterMediaArgs>;
      Querystring: { cursor?: string };
    }>("/feed/media/new", async (request, reply) => {
      const response = await service.getNewMedia(request.body);
      reply.send(response);
    });

    fastify.post<{
      Body: ShelfDataRequest<FarcasterFrameArgs>;
      Querystring: { cursor?: string };
    }>("/feed/frames/new", async (request, reply) => {
      const response = await service.getNewFrames(request.body);
      reply.send(response);
    });

    fastify.post<{
      Body: ShelfDataRequest<FarcasterEmbedArgs>;
      Querystring: { cursor?: string };
    }>("/feed/embeds/new", async (request, reply) => {
      const response = await service.getNewEmbeds(request.body);
      reply.send(response);
    });
  });
};
