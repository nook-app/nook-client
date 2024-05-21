import { NftFeedRequest } from "@nook/common/types";
import { FastifyInstance } from "fastify";
import { NftService } from "../services/nft";

export const nftRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new NftService(fastify);

    fastify.post<{ Body: NftFeedRequest }>("/nfts", async (request, reply) => {
      const response = await service.getNfts(request.body);
      return reply.send(response);
    });
  });
};
