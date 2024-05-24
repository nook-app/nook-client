import {
  TokenChart,
  TokenHoldings,
  TokensFilter,
  Token,
} from "@nook/common/types";
import { makeRequest } from "../utils";
import { useQuery } from "@tanstack/react-query";

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
