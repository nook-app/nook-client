import { FarcasterUser } from "./farcaster";

export type TransactionResponse = {
  chainId: number;
  blockNumber: number;
  blockHash: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  parties: string[];
  netAssetTransfers: {
    [key: string]: {
      sent: TransactionAssetTransfer[];
      received: TransactionAssetTransfer[];
    };
  };
  context: {
    summaries: {
      category: string;
      en: {
        title: string;
        default: string;
      };
    };
    // biome-ignore lint/suspicious/noExplicitAny: can be anything for now
    variables: Record<string, any>;
  };
  // biome-ignore lint/suspicious/noExplicitAny: can be anything for now
  enrichedParties: Record<string, any>;
};

export type TransactionAssetTransfer = {
  asset: string;
  id: string;
  tokenId: string;
  value: string;
  type: string;
  imageUrl?: string;
};

export type Transaction = {
  hash: string;
  chainId: number;
  timestamp: number;
  from: string;
  enrichedParties: Record<string, EnrichedParty[]>;
  users: Record<string, FarcasterUser>;
  context: TransactionContext;
  assetsEnriched: Record<string, Asset>;
};

type TransactionContext = {
  variables: Record<string, Record<string, string>>;
  summaries: {
    en: {
      default: string;
    };
  };
};

type EnrichedParty = {
  ensNew: {
    handle: string;
    avatar: string;
  };
  label: {
    public: string;
  };
  decimals?: number;
  symbol?: string;
};

type Asset = {
  contract: string;
  imageUrl: string;
  tokenId: string;
  type: string;
  value: string;
};
