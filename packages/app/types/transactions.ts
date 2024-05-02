import { FarcasterUser } from "./user";

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
