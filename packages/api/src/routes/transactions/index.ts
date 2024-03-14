import { FastifyInstance } from "fastify";
import { GetContentRequest, GetTransactionsRequest } from "@nook/common/types";
import { ContentAPIClient } from "@nook/common/clients";
import {
  TransactionsApi,
  TransactionsControllerGetTransactionsRequest,
  GetTransactionDto,
  AddressTag,
} from "@nook/common/onceupon";
import { FarcasterAPIClient } from "@nook/common/clients";
import { decodeCursor, encodeCursor } from "@nook/common/utils";

export const transactionRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const farcasterClient = new FarcasterAPIClient();
    const client = new TransactionsApi();

    fastify.post<{ Body: GetTransactionsRequest }>(
      "/transactions",
      async (request, reply) => {
        await request.jwtVerify();
        const farResponse = await farcasterClient.getUsers([request.body.fid]);
        const addresses = farResponse.data[0].verifiedAddresses;
        const contextAddresses: AddressTag[] = addresses.map((address) => {
          return { address, toFromAll: "From" };
        });
        const cursor = decodeCursor(request.body.cursor) ?? {
          // use current timestamp for the lte dateRange and rely on skip to
          // paginate from beginning of that timestamp
          // subtract one just in case they're still indexing txs
          timestamp: Math.floor(new Date().getTime() / 1000) - 1,
          skip: 0,
        };

        const req: TransactionsControllerGetTransactionsRequest = {
          getTransactionDto: {
            contextAddresses,
            filterAddresses: [],
            sort: -1,
            limit: 25,
            skip: cursor.skip as number,
            functionSelectors: [],
            tokenTransfers: [],
            dateRange: { $lte: cursor.timestamp as number },
            chainIds: [0],
          },
        };

        // do we want to transform data..?
        const data = await client.transactionsControllerGetTransactions(req);
        const nextCursor =
          data.length === 25
            ? encodeCursor({
                timestamp: cursor.timestamp,
                skip: (cursor.skip as number) + 25,
              })
            : null;
        return reply.send({ nextCursor, data });
      },
    );
  });
};
