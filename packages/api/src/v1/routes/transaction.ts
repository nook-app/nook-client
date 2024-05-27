import { FastifyInstance } from "fastify";
import { TransactionFeedRequest } from "@nook/common/types";
import { TransactionService } from "../services/transaction";

export const transactionRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const service = new TransactionService(fastify);

    fastify.post<{ Body: TransactionFeedRequest }>(
      "/transactions",
      async (request, reply) => {
        let viewerFid: string | undefined;
        try {
          const { fid } = (await request.jwtDecode()) as { fid: string };
          viewerFid = fid;
        } catch (e) {}

        const response = await service.getTransactions(request.body, viewerFid);
        return reply.send(response);
      },
    );
  });
};
