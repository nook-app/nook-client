import {
  TokensFilter,
  TokenTransactionFilter,
  TokenTransactions,
  GetTokenHoldersRequest,
  FetchTokenHoldersResponse,
} from "@nook/common/types";
import {
  useInfiniteQuery,
  useQuery,
  InfiniteData,
  UseInfiniteQueryResult,
  useQueryClient,
} from "@tanstack/react-query";
import { useState } from "react";
import {
  fetchFarcasterTokenHolders,
  fetchFollowingTokenHolders,
  fetchToken,
  fetchTokenChart,
  fetchTokenHolders,
  fetchTokenHoldings,
  fetchTokenTransactions,
} from "../../api/token";

export const useTokenHoldings = (filter: TokensFilter) => {
  return useQuery({
    queryKey: ["tokenHoldings", JSON.stringify(filter)],
    queryFn: async () => {
      return await fetchTokenHoldings(filter);
    },
  });
};

export const useToken = (tokenId: string) => {
  return useQuery({
    queryKey: ["token", tokenId],
    queryFn: async () => {
      return await fetchToken(tokenId);
    },
  });
};

export const useTokenChart = (tokenId: string, timeframe: string) => {
  return useQuery({
    queryKey: ["tokenChart", tokenId, timeframe],
    queryFn: async () => {
      return await fetchTokenChart(tokenId, timeframe);
    },
  });
};

export const useTokenTransactions = (
  req: TokenTransactionFilter,
  initialData?: TokenTransactions,
): UseInfiniteQueryResult<InfiniteData<TokenTransactions>, unknown> & {
  refresh: () => Promise<void>;
} => {
  const [isRefetching, setIsRefetching] = useState(false);
  const queryClient = useQueryClient();

  const queryKey = ["tokenTransactions", JSON.stringify(req)];

  const props = useInfiniteQuery<
    TokenTransactions,
    unknown,
    InfiniteData<TokenTransactions>,
    string[],
    string | undefined
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const data = await fetchTokenTransactions({ ...req, cursor: pageParam });
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
    queryClient.setQueryData<InfiniteData<TokenTransactions>>(
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

export const useTokenHolders = (
  req: GetTokenHoldersRequest,
  initialData?: FetchTokenHoldersResponse,
) => {
  return useInfiniteQuery<
    FetchTokenHoldersResponse,
    unknown,
    InfiniteData<FetchTokenHoldersResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["tokenHolders", JSON.stringify(req)],
    queryFn: async ({ pageParam }) => {
      const data = await fetchTokenHolders(req, pageParam);
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
  });
};

export const useFarcasterTokenHolders = (
  req: GetTokenHoldersRequest,
  initialData?: FetchTokenHoldersResponse,
) => {
  return useInfiniteQuery<
    FetchTokenHoldersResponse,
    unknown,
    InfiniteData<FetchTokenHoldersResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["farcasterTokenHolders", JSON.stringify(req)],
    queryFn: async ({ pageParam }) => {
      const data = await fetchFarcasterTokenHolders(req, pageParam);
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
  });
};

export const useFollowingTokenHolders = (
  req: GetTokenHoldersRequest,
  initialData?: FetchTokenHoldersResponse,
) => {
  return useInfiniteQuery<
    FetchTokenHoldersResponse,
    unknown,
    InfiniteData<FetchTokenHoldersResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["followingTokenHolders", JSON.stringify(req)],
    queryFn: async ({ pageParam }) => {
      const data = await fetchFollowingTokenHolders(req, pageParam);
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
  });
};
