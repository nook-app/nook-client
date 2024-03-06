import { NFTCollection } from "@nook/common/types/providers/simplehash/contract";
import { NFT } from "@nook/common/types/providers/simplehash/nft";
export declare const getChainContent: (contentId: string) => Promise<NFTCollection | NFT | undefined>;
