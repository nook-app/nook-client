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

export const fetchToken = async (tokenId: string): Promise<Token> => {
  return await makeRequest(`/v1/tokens/${tokenId}`);
};

export const fetchTokenChart = async (
  tokenId: string,
  timeframe: string,
): Promise<TokenChart> => {
  return await makeRequest(`/v1/tokens/${tokenId}/charts/${timeframe}`);
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

export const fetchTokenMutualsPreview = async (
  tokenId: string,
): Promise<TokenMutualsPreview> => {
  return await makeRequest(`/v1/tokens/${tokenId}/mutuals-preview`);
};
