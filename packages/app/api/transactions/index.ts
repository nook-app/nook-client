import {
  FetchTransactionsResponse,
  TransactionFeedFilter,
} from "@nook/common/types";
import { makeRequest } from "../utils";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

export const fetchTransactionFeed = async (
  filter: TransactionFeedFilter,
  cursor?: string,
): Promise<FetchTransactionsResponse> => {
  return await makeRequest("/onceupon/transactions/feed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filter, cursor }),
  });
};

export const useTransactionFeed = (
  filter: TransactionFeedFilter,
  initialData?: FetchTransactionsResponse,
) => {
  return useInfiniteQuery<
    FetchTransactionsResponse,
    unknown,
    InfiniteData<FetchTransactionsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["txFeed", JSON.stringify(filter)],
    queryFn: async ({ pageParam }) => {
      const data = await fetchTransactionFeed(filter, pageParam);
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
