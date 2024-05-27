import {
  FetchTransactionsResponseV1,
  TransactionFeedFilter,
} from "@nook/common/types";
import { makeRequest } from "../utils";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useUserStore } from "../../store/useUserStore";
import { useNftStore } from "../../store/useNftStore";
import { useTokenStore } from "../../store/useTokenStore";

export const fetchTransactionFeed = async (
  filter: TransactionFeedFilter,
  cursor?: string,
): Promise<FetchTransactionsResponseV1> => {
  return await makeRequest("/v1/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filter, cursor }),
  });
};

export const useTransactionFeed = (
  filter: TransactionFeedFilter,
  initialData?: FetchTransactionsResponseV1,
) => {
  const addUsers = useUserStore((state) => state.addUsers);
  const addNfts = useNftStore((state) => state.addNfts);
  const addCollections = useNftStore((state) => state.addCollections);
  const addTokens = useTokenStore((state) => state.addTokens);
  return useInfiniteQuery<
    FetchTransactionsResponseV1,
    unknown,
    InfiniteData<FetchTransactionsResponseV1>,
    string[],
    string | undefined
  >({
    queryKey: ["txFeed", JSON.stringify(filter)],
    queryFn: async ({ pageParam }) => {
      const data = await fetchTransactionFeed(filter, pageParam);
      addUsers(data.data.flatMap((tx) => Object.values(tx.users)));
      addNfts(data.data.flatMap((tx) => Object.values(tx.collectibles)));
      addCollections(
        data.data
          .flatMap((tx) => Object.values(tx.collectibles))
          .map((nft) => nft.collection),
      );
      addTokens(data.data.flatMap((tx) => Object.values(tx.tokens)));
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    initialPageParam: initialData?.nextCursor,
    refetchOnWindowFocus: false,
  });
};
