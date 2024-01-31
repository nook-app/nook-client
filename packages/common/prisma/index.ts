import * as farcaster from "./farcaster";
import * as relations from "./relations";
export { farcaster, relations };
declare global {
  type FarcasterCastMention = {
    hash: string;
    fid: bigint;
    mention: bigint;
    mentionPosition: bigint;
    timestamp: Date;
    deletedAt?: Date;
  };
}
