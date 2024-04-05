import { FastifyInstance } from "fastify";
import { GetContentRequest } from "@nook/common/types";
import { DiscoverService } from "../../services/discover";

export const discoverRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new DiscoverService(fastify);

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
