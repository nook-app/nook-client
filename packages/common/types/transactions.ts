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
