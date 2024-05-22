import { FarcasterUser } from "./farcaster";
import { UserFilter } from "./nook";

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
  data: (NftOwner & { user?: FarcasterUser })[];
  nextCursor?: string;
};

export type FetchNftFarcasterCollectorsResponse = {
  data: NftFarcasterCollector[];
  nextCursor?: string;
};

export type NftFeedRequest = {
  filter: NftFeedFilter;
  cursor?: string;
};

export type NftFeedFilter = {
  users: UserFilter;
  chains?: string[];
  orderBy?: NftFeedOrderBy;
};

export type NftFeedOrderBy =
  | "transfer_time__desc"
  | "floor_price__desc"
  | "name__asc";

export type NftFeedDisplay = "collections" | "tokens";
