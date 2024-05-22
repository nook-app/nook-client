import { FarcasterUser } from "./farcaster";
import { UserFilter } from "./nook";
import { SimpleHashNFTEvent } from "./simplehash";

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

export type GetNftCollectionCollectorsRequest = {
  collectionId: string;
  cursor?: string;
  sort?: "quantity" | "acquired";
  viewerFid?: string;
};

export type GetNftCollectorsRequest = {
  nftId: string;
  cursor?: string;
  sort?: "quantity" | "acquired";
  viewerFid?: string;
};

export type GetNftCollectionEventsRequest = {
  collectionId: string;
  cursor?: string;
  viewerFid?: string;
};

export type GetNftEventsRequest = {
  nftId: string;
  cursor?: string;
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

export type NftEvent = SimpleHashNFTEvent & {
  from_user?: FarcasterUser;
  to_user?: FarcasterUser;
};

export type FetchNftEventsResponse = {
  data: NftEvent[];
  nextCursor?: string;
};
