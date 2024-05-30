import {
  FetchTransactionsResponseV1,
  TransactionFeedFilter,
} from "@nook/common/types";
import { makeRequest } from "../utils";
import {
  InfiniteData,
  UseInfiniteQueryResult,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useUserStore } from "../../store/useUserStore";
import { useNftStore } from "../../store/useNftStore";
import { useTokenStore } from "../../store/useTokenStore";
import { useState } from "react";

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
): UseInfiniteQueryResult<
  InfiniteData<FetchTransactionsResponseV1>,
  unknown
> & {
  refresh: () => Promise<void>;
} => {
  const [isRefetching, setIsRefetching] = useState(false);
  const queryClient = useQueryClient();

  const addUsers = useUserStore((state) => state.addUsers);
  const addNfts = useNftStore((state) => state.addNfts);
  const addCollections = useNftStore((state) => state.addCollections);
  const addTokens = useTokenStore((state) => state.addTokens);

  const queryKey = ["txFeed", JSON.stringify(filter)];

  const props = useInfiniteQuery<
    FetchTransactionsResponseV1,
    unknown,
    InfiniteData<FetchTransactionsResponseV1>,
    string[],
    string | undefined
  >({
    queryKey,
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

  const refresh = async () => {
    setIsRefetching(true);
    queryClient.setQueryData<InfiniteData<FetchTransactionsResponseV1>>(
      queryKey,
      (data) => {
        if (!data) return undefined;
        return {
          pages: data.pages.slice(0, 1),
          pageParams: data.pageParams.slice(0, 1),
        };
      },
    );
    await props.refetch();
    setIsRefetching(false);
  };

  return { ...props, refresh, isRefetching };
};
