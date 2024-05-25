import { FastifyInstance } from "fastify";
import { TokenService } from "../services/token";
import {
  GetTokenHoldersRequest,
  TokenTransactionFilter,
  TokensFilter,
} from "@nook/common/types";

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

    fastify.post<{ Body: TokenTransactionFilter }>(
      "/tokens/transactions",
      async (request, reply) => {
        const response = await service.getTokenTransactions(request.body);
        return reply.send(response);
      },
    );

    fastify.get<{ Params: { tokenId: string } }>(
      "/tokens/:tokenId/mutuals-preview",
      async (request, reply) => {
        const { fid } = (await request.jwtDecode()) as { fid: string };

        const response = await service.getTokenMutualsPreview(
          request.params.tokenId,
          fid,
        );

        return reply.send(response);
      },
    );

    fastify.post<{
      Body: GetTokenHoldersRequest;
    }>("/tokens/holders", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}

      const response = await service.getTokenHolders({
        ...request.body,
        viewerFid,
      });

      return reply.send(response);
    });

    fastify.post<{
      Body: GetTokenHoldersRequest;
    }>("/tokens/holders/farcaster", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}

      const response = await service.getFarcasterTokenHolders({
        ...request.body,
        viewerFid,
      });

      return reply.send(response);
    });

    fastify.post<{
      Body: GetTokenHoldersRequest;
    }>("/tokens/holders/following", async (request, reply) => {
      const { fid } = (await request.jwtDecode()) as { fid: string };

      const response = await service.getFollowingTokenHolders(
        request.body,
        fid,
      );

      return reply.send(response);
    });
  });
};
