import { FastifyInstance } from "fastify";
import { GetContentRequest, GetTransactionsRequest } from "@nook/common/types";
import { ContentAPIClient } from "@nook/common/clients";
import {
  TransactionsApi,
  TransactionsControllerGetTransactionsRequest,
  GetTransactionDto,
} from "@nook/common/onceupon";
import { FarcasterAPIClient } from "@nook/common/clients";

export const transactionRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const farcasterClient = new FarcasterAPIClient();
    const client = new TransactionsApi();

    fastify.post<{ Body: GetTransactionsRequest }>(
      "/transactions",
      async (request, reply) => {
        await request.jwtVerify();
        const addresses = (await farcasterClient.getUsers([request.body.fid]))
          .data[0].verifiedAddresses;

        const req: TransactionsControllerGetTransactionsRequest = {
          getTransactionDto: {
            contextAddresses: addresses.map((address) => {
              return { address, toFromAll: "From" };
            }),
            filterAddresses: [],
            sort: -1,
            skip: 0,
            limit: 25,
            // marked as optional but get 500 if these aren't included
            functionSelectors: [],
            tokenTransfers: [],
            dateRange: {},
          },
        };
        // do we want to transform data..?
        const data = await client.transactionsControllerGetTransactions(req);
        return reply.send(data);
      },
    );
  });
};
