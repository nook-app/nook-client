import {
  TokenChart,
  TokenHoldings,
  TokensFilter,
  Token,
  TokenTransactionFilter,
  TokenTransactions,
  GetTokenHoldersRequest,
  FetchTokenHoldersResponse,
  TokenMutualsPreview,
} from "@nook/common/types";
import { makeRequest } from "../utils";
import {
  useInfiniteQuery,
  useQuery,
  InfiniteData,
} from "@tanstack/react-query";

export const fetchTokenHoldings = async (
  filter: TokensFilter,
): Promise<TokenHoldings> => {
  return await makeRequest("/v1/tokens/holdings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(filter),
  });
};

export const useTokenHoldings = (filter: TokensFilter) => {
  return useQuery({
    queryKey: ["tokenHoldings", JSON.stringify(filter)],
    queryFn: async () => {
      return await fetchTokenHoldings(filter);
    },
  });
};

export const fetchToken = async (tokenId: string): Promise<Token> => {
  return await makeRequest(`/v1/tokens/${tokenId}`);
};

export const useToken = (tokenId: string) => {
  return useQuery({
    queryKey: ["token", tokenId],
    queryFn: async () => {
      return await fetchToken(tokenId);
    },
  });
};

export const fetchTokenChart = async (
  tokenId: string,
  timeframe: string,
): Promise<TokenChart> => {
  return await makeRequest(`/v1/tokens/${tokenId}/charts/${timeframe}`);
};

export const useTokenChart = (tokenId: string, timeframe: string) => {
  return useQuery({
    queryKey: ["tokenChart", tokenId, timeframe],
    queryFn: async () => {
      return await fetchTokenChart(tokenId, timeframe);
    },
  });
};

export const fetchTokenTransactions = async (
  req: TokenTransactionFilter,
): Promise<TokenTransactions> => {
  return await makeRequest("/v1/tokens/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
};

export const useTokenTransactions = (
  req: TokenTransactionFilter,
  initialData?: TokenTransactions,
) => {
  return useInfiniteQuery<
    TokenTransactions,
    unknown,
    InfiniteData<TokenTransactions>,
    string[],
    string | undefined
  >({
    queryKey: ["tokenTransactions", JSON.stringify(req)],
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
};

export const fetchTokenHolders = async (
  req: GetTokenHoldersRequest,
  cursor?: string,
): Promise<FetchTokenHoldersResponse> => {
  return await makeRequest("/v1/tokens/holders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...req, cursor }),
  });
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

export const fetchFarcasterTokenHolders = async (
  req: GetTokenHoldersRequest,
  cursor?: string,
): Promise<FetchTokenHoldersResponse> => {
  return await makeRequest("/v1/tokens/holders/farcaster", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...req, cursor }),
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

export const fetchFollowingTokenHolders = async (
  req: GetTokenHoldersRequest,
  cursor?: string,
): Promise<FetchTokenHoldersResponse> => {
  return await makeRequest("/v1/tokens/holders/following", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...req, cursor }),
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

export const fetchTokenMutualsPreview = async (
  tokenId: string,
): Promise<TokenMutualsPreview> => {
  return await makeRequest(`/v1/tokens/${tokenId}/mutuals-preview`);
};
