import { FarcasterUserV1 } from "./farcaster";
import { OnceUponTransaction, PartyEnriched } from "./providers/onceupon";
import { SimpleHashNFT } from "./simplehash";
import { Token } from "./token";

export type Transaction = OnceUponTransaction & {
  users: Record<string, FarcasterUserV1>;
  tokens: Record<string, Token>;
  collectibles: Record<string, SimpleHashNFT>;
  enrichedParties: Record<string, PartyEnriched>;
};

export type FetchTransactionsResponseV1 = {
  data: Transaction[];
  nextCursor?: string;
};
