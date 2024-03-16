import {
  FarcasterFeedFilterWithContext,
  UserFilterWithContext,
} from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { FarcasterService } from "../service/farcaster";

export const feedRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new FarcasterService(fastify);

    fastify.post<{
      Body: FarcasterFeedFilterWithContext;
      Querystring: { cursor?: string };
    }>("/feed", async (request, reply) => {
      const data = await service.getFeed(request.body, request.query.cursor);
      reply.send(data);
    });

    fastify.post<{
      Body: UserFilterWithContext;
      Querystring: { cursor?: string };
    }>("/addresses", async (request, reply) => {
      const response = await service.getAddresses(request.body);
      reply.send(response);
    });
  });
};
