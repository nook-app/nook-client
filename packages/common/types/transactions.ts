import { FarcasterUser } from "./farcaster";
import { OnceUponTransaction } from "./providers/onceupon";
import { SimpleHashNFT } from "./simplehash";
import { Token } from "./token";

export type Transaction = OnceUponTransaction & {
  users: Record<string, FarcasterUser>;
  tokens: Record<string, Token>;
  collectibles: Record<string, SimpleHashNFT>;
};
export type FetchTransactionsResponseV1 = {
  data: Transaction[];
  nextCursor?: string;
};
