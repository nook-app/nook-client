import { FastifyInstance } from "fastify";
import {
  TransactionFeedFilterWithContext,
  TransactionResponse,
} from "@nook/common/types";
import {
  TransactionsApi,
  TransactionsControllerGetTransactionsRequest,
  AddressTag,
} from "@nook/common/onceupon";
import { FarcasterAPIClient } from "@nook/common/clients";
import { decodeCursor, encodeCursor } from "@nook/common/utils";

export const transactionRoutes = async (fastify: FastifyInstance) => {
  fastify.register(async (fastify: FastifyInstance) => {
    const farcasterClient = new FarcasterAPIClient();
    const client = new TransactionsApi();

    fastify.post<{
      Body: TransactionFeedFilterWithContext;
      Querystring: { cursor?: string };
    }>("/transactions", async (request, reply) => {
      await request.jwtVerify();
      if (!request.body.filter || !request.body.filter.userFilter) {
        return reply.status(400).send({ message: "Invalid request" });
      }

      const response = await farcasterClient.getAddresses({
        filter: request.body.filter.userFilter,
        context: request.body.context,
      });
      if (!response?.data || response?.data.length === 0) {
        return reply.status(404).send({ message: "Addresses not found" });
      }

      const contextAddresses: AddressTag[] = response?.data.map((address) => {
        return { address, toFromAll: "From" };
      });
      const cursor = decodeCursor(request.query.cursor) ?? {
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
      const rawData = await client.transactionsControllerGetTransactions(req);
      const data: TransactionResponse[] = rawData.map((tx) => ({
        chainId: tx.chainId,
        blockNumber: tx.blockNumber,
        blockHash: tx.blockHash,
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value,
        timestamp: tx.timestamp,
        parties: tx.parties,
        netAssetTransfers: tx.netAssetTransfers,
        context: tx.context,
        enrichedParties: tx.enrichedParties,
      }));

      const nextCursor =
        data.length === 25
          ? encodeCursor({
              timestamp: cursor.timestamp,
              skip: (cursor.skip as number) + 25,
            })
          : null;
      return reply.send({ nextCursor, data });
    });
  });
};
