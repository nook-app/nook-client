import { FastifyInstance } from "fastify";
import { GetContentRequest } from "@nook/common/types";
import { DiscoverService } from "../../services/discover";
import { FarcasterAPIClient } from "@nook/common/clients";

export const discoverRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const farcaster = new FarcasterAPIClient();
    const service = new DiscoverService(fastify);

    fastify.get<{ Querystring: { query: string } }>(
      "/search/preview",
      async (request, reply) => {
        const [users, channels] = await Promise.all([
          farcaster.searchUsers(request.query.query, 5),
          farcaster.searchChannels(request.query.query, 5),
        ]);

        return reply.send({ users: users.data, channels: channels.data });
      },
    );

    fastify.post<{ Body: GetContentRequest }>(
      "/discover/cashtags",
      async (request, reply) => {
        await request.jwtVerify();
        const data = await service.getTrendingCashtags();
        return reply.send({ data: data.slice(0, 10) });
      },
    );
  });
};
