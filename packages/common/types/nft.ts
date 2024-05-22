import { FarcasterUser } from "./farcaster";

export type NftMutualsPreview = {
  preview: FarcasterUser[];
  total: number;
};

export type NftOwner = {
  nftId: string;
  ownerAddress: string;
  tokenId: string;
  quantity: number;
  firstAcquiredDate: number;
  lastAcquiredDate: number;
  fid?: string;
};

export type NftFarcasterOwner = {
  fid: string;
  quantity: number;
  firstAcquiredDate: number;
  lastAcquiredDate: number;
  tokens: NftOwner[];
};

export type GetNftCollectorsRequest = {
  collectionId: string;
  cursor?: string;
  sort?: "quantity" | "acquired";
  viewerFid?: string;
};

export type NftFarcasterCollector = NftFarcasterOwner & {
  user?: FarcasterUser;
};

export type FetchNftCollectorsResponse = {
  data: NftOwner[];
  nextCursor?: string;
};

export type FetchNftFarcasterCollectorsResponse = {
  data: NftFarcasterCollector[];
  nextCursor?: string;
};
