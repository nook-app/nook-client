import { FarcasterUser } from "./farcaster";
import { ZerionTransaction } from "./providers/zerion/transaction";

export type TokensFilter = {
  fid: string;
};

export type TokenTransactionFilter = {
  fid: string;
  tokens: string[];
  cursor?: string;
};

export type TokenHoldings = {
  data: TokenHolding[];
  addresses: string[];
  chains: string[];
  tokens: string[];
  totalValue: number;
};

export type TokenHolding = {
  id: string;
  address: string;
  name: string;
  symbol: string;
  icon: {
    url: string;
  } | null;
  value: number;
  price: number;
  changes: TokenPriceChanges | null;
  quantity: TokenQuantity;
  instances: TokenInstance[];
};

export type TokenInstance = {
  chainId: string;
  address: string | null;
  decimals: number;
  value: number;
  price: number;
  changes: TokenPriceChanges | null;
  quantity: TokenQuantity;
  updatedAt: number;
  updatedAtBlock: number;
};

export type TokenQuantity = {
  int: string;
  decimals: number;
  float: number;
  numeric: string;
};

export type TokenPriceChanges = {
  absolute1d: number;
  percent1d: number;
};

export type Token = {
  id: string;
  name: string;
  symbol: string;
  description: string | null;
  icon: {
    url: string;
  } | null;
  externalLinks: {
    name: string;
    type: string;
    url: string;
  }[];
  instances: {
    chainId: string;
    address: string | null;
    decimals: number;
  }[];
  stats: {
    totalSupply: number;
    circulatingSupply: number;
    marketCap: number;
    fullyDilutedValuation: number;
    price: number;
    changes: {
      percent1d: number;
      percent30d: number;
      percent90d: number;
      percent365d: number;
    };
  };
};

export type TokenChart = {
  timeframe: string;
  beginAt: number;
  endAt: number;
  stats: {
    first: number;
    min: number;
    avg: number;
    max: number;
    last: number;
  };
  points: number[][]; // [timestamp, value]
};

export type TokenTransactions = {
  data: ZerionTransaction[];
  nextCursor?: string;
  address: string;
};

export type TokenHolder = {
  id: string;
  chainId: string;
  address: string;
  ownerAddress: string;
  quantity: number;
  firstTransferredDate: number;
  lastTransferredDate: number;
  fid?: string;
};

export type GetTokenHoldersRequest = {
  tokenId: string;
  cursor?: string;
  viewerFid?: string;
};

export type TokenMutualsPreview = {
  preview: FarcasterUser[];
  total: number;
};

export type FetchTokenHoldersResponse = {
  data: (TokenHolder & { user?: FarcasterUser })[];
  nextCursor?: string;
};
