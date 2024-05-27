import { FarcasterUser } from "./farcaster";
import { UserFilter } from "./nook";
import { SimpleHashNFT, SimpleHashNFTEvent } from "./simplehash";

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

export type NftMarket = {
  mintStages: NftMintStage[];
  market: {
    floorAsk: NftAsk | null;
    topBid: NftAsk | null;
  };
};

export type NftMintStage = {
  stage: string;
  kind: string;
  tokenId: string;
  price: NftPrice;
  startTime: number;
  endTime: number;
  maxMintsPerWallet: number | null;
};

export type NftAsk = {
  id: string;
  price: NftPrice;
  maker: string;
  validFrom: number;
  validUntil: number;
  source: {
    id: string;
    domain: string;
    name: string;
    icon: string;
    url: string;
  };
};

type NftPrice = {
  currency: {
    contract: string;
    name: string;
    symbol: string;
    decimals: number;
  };
  amount: {
    raw: string;
    decimal: number;
    usd: number;
    native: number;
  };
};
