import { FastifyInstance } from "fastify";
import { TokenService } from "../services/token";
import { TokensFilter } from "@nook/common/types";

export const tokenRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new TokenService(fastify);

    fastify.post<{ Body: TokensFilter }>(
      "/tokens/holdings",
      async (request, reply) => {
        const response = await service.getTokens(request.body);
        return reply.send(response);
      },
    );

    fastify.get<{ Params: { tokenId: string } }>(
      "/tokens/:tokenId",
      async (request, reply) => {
        const response = await service.getToken(request.params.tokenId);
        return reply.send(response);
      },
    );

    fastify.get<{ Params: { tokenId: string; timeframe: string } }>(
      "/tokens/:tokenId/charts/:timeframe",
      async (request, reply) => {
        const response = await service.getTokenChart(
          request.params.tokenId,
          request.params.timeframe,
        );
        return reply.send(response);
      },
    );
  });
};
