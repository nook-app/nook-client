import { FastifyInstance } from "fastify";
import { FarcasterUser, TransactionFeedRequest } from "@nook/common/types";
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
      const cursor = decodeCursor(request.body.cursor);

      let chainIds = request.body.filter.chains;
      if (!chainIds || chainIds.length === 0) {
        chainIds = [0];
      }

      const timestamp = cursor?.timestamp
        ? Number(cursor.timestamp)
        : Math.floor(new Date().getTime() / 1000) - 1;

      const req: TransactionsControllerGetTransactionsRequest = {
        getTransactionDto: {
          contextAddresses,
          filterAddresses: [],
          contextActions: ["-RECEIVED_AIRDROP"],
          sort: -1,
          limit: 25,
          skip: 0,
          functionSelectors: [],
          tokenTransfers: [],
          dateRange: cursor?.timestamp ? { $lte: timestamp } : {},
          chainIds,
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
          for (const address of user.verifiedAddresses ?? []) {
            acc[address.address] = user;
          }
          acc[user.fid] = user;
          return acc;
        },
        {} as Record<string, FarcasterUser>,
      );

      const enrichedData = rawData.map((tx) => {
        const users: Record<string, FarcasterUser> = {};

        if (!tx.enrichedParties) return { ...tx, users: {} };

        if (userMap[tx.from]) {
          users[tx.from] = userMap[tx.from];
        }

        for (const party of Object.entries(tx.enrichedParties)) {
          for (const info of party[1]) {
            if (info.farcaster?.fid) {
              users[party[0]] = userMap[info.farcaster.fid];
            }
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
              timestamp: rawData[rawData.length - 1].timestamp - 1,
            })
          : null;
      return reply.send({ nextCursor, data: enrichedData || [] });
    });
  });
};
