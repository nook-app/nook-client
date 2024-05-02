import { FastifyInstance } from "fastify";
import {
  FarcasterUser,
  TransactionFeedRequest,
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
      Body: TransactionFeedRequest;
    }>("/onceupon/transactions/feed", async (request, reply) => {
      let viewerFid: string | undefined;
      try {
        const { fid } = (await request.jwtDecode()) as { fid: string };
        viewerFid = fid;
      } catch (e) {}

      if (!request.body.filter.users) {
        return reply.status(400).send({ message: "Invalid request" });
      }

      const response = await farcasterClient.getUserAddresses(
        request.body.filter.users,
      );

      if (!response?.data || response?.data.length === 0) {
        return reply.status(404).send({ message: "Addresses not found" });
      }

      const contextAddresses: AddressTag[] = response?.data.map((address) => {
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
          chainIds: request.body.filter.chains ?? [0],
        },
      };

      // do we want to transform data..?
      const rawData = await client.transactionsControllerGetTransactions(req);

      if (!rawData) {
        return reply.send({ nextCursor: null, data: [] });
      }

      const allEnrichedParties = rawData
        .flatMap((tx) =>
          tx?.enrichedParties ? Object.values(tx.enrichedParties) : [],
        )
        .flat();

      const fids = allEnrichedParties
        .map((party) => party?.farcaster?.fid?.toString())
        .filter(Boolean) as string[];

      const users = await farcasterClient.getUsers(
        { fids: Array.from(new Set(fids)) },
        viewerFid,
      );

      const userMap = users.data.reduce(
        (acc, user) => {
          acc[user.fid] = user;
          return acc;
        },
        {} as Record<string, FarcasterUser>,
      );

      const enrichedData = rawData.map((tx) => {
        const users: Record<string, FarcasterUser> = {};

        if (!tx.enrichedParties) return { ...tx, users: {} };

        for (const party of Object.entries(tx.enrichedParties)) {
          const info = party[1][0];
          if (info.farcaster?.fid) {
            users[party[0]] = userMap[info.farcaster.fid];
          }
        }

        return {
          ...tx,
          users,
        };
      });

      const nextCursor =
        rawData.length === 25
          ? encodeCursor({
              timestamp: cursor.timestamp,
              skip: (cursor.skip as number) + 25,
            })
          : null;
      return reply.send({ nextCursor, data: enrichedData?.reverse() || [] });
    });
  });
};
