import { FarcasterUserV1 } from "./farcaster";
import { NftAsk, NftMarket, NftMintStage } from "./nft";
import { OnceUponTransaction, PartyEnriched } from "./providers/onceupon";
import { SimpleHashNFT } from "./simplehash";
import { Token } from "./token";

export type NFTWithMarket = SimpleHashNFT & {
  mintStages?: NftMintStage[];
  market?: {
    floorAsk: NftAsk | null;
    topBid: NftAsk | null;
  };
};

export type Transaction = OnceUponTransaction & {
  users: Record<string, FarcasterUserV1>;
  tokens: Record<string, Token>;
  collectibles: Record<string, NFTWithMarket>;
  enrichedParties: Record<string, PartyEnriched>;
};

export type FetchTransactionsResponseV1 = {
  data: Transaction[];
  nextCursor?: string;
};
