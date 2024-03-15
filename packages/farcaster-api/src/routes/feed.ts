import {
  FarcasterFeedRequest,
  RequestContext,
  UserFilter,
} from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { FarcasterService } from "../service/farcaster";

export const feedRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new FarcasterService(fastify);

    fastify.post<{
      Body: FarcasterFeedRequest;
      Querystring: { cursor?: string };
    }>("/feed", async (request, reply) => {
      const data = await service.getFeed(
        request.body.args,
        request.query.cursor,
        request.body.context?.viewerFid,
      );
      reply.send(data);
    });

    fastify.post<{
      Body: UserFilter & { context?: RequestContext };
      Querystring: { cursor?: string };
    }>("/addresses", async (request, reply) => {
      const response = await service.getAddresses(
        request.body,
        request.body.context?.viewerFid,
      );
      reply.send(response);
    });
  });
};
