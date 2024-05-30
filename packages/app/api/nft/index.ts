import {
  FetchNftCollectionsResponse,
  FetchNftCollectorsResponse,
  FetchNftCreatedCollectionsResponse,
  FetchNftEventsResponse,
  FetchNftFarcasterCollectorsResponse,
  FetchNftsResponse,
  GetNftCollectionCollectorsRequest,
  GetNftCollectionEventsRequest,
  GetNftCollectorsRequest,
  GetNftEventsRequest,
  NftFeedFilter,
  NftMarket,
  NftMutualsPreview,
  SimpleHashCollection,
  SimpleHashNFT,
} from "@nook/common/types";
import { makeRequest } from "../utils";

export const fetchNftFeed = async (
  filter: NftFeedFilter,
  cursor?: string,
): Promise<FetchNftsResponse> => {
  return await makeRequest("/v1/nfts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filter, cursor }),
  });
};

export const fetchNftCollectionFeed = async (
  filter: NftFeedFilter,
  cursor?: string,
): Promise<FetchNftCollectionsResponse> => {
  return await makeRequest("/v1/nfts/collections", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filter, cursor }),
  });
};

export const fetchNftCreatedFeed = async (
  filter: NftFeedFilter,
  cursor?: string,
): Promise<FetchNftsResponse> => {
  return await makeRequest("/v1/nfts/created", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filter, cursor }),
  });
};

export const fetchNftCollectionCreatedFeed = async (
  filter: NftFeedFilter,
  cursor?: string,
): Promise<FetchNftCreatedCollectionsResponse> => {
  return await makeRequest("/v1/nfts/collections/created", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filter, cursor }),
  });
};

export const fetchNft = async (nftId: string): Promise<SimpleHashNFT> => {
  return await makeRequest(`/v1/nfts/${nftId}`);
};

export const fetchNftMarkets = async (nftId: string): Promise<NftMarket> => {
  return await makeRequest(`/v1/nfts/${nftId}/markets`);
};

export const fetchNftCollection = async (
  collectionId: string,
): Promise<SimpleHashCollection> => {
  return await makeRequest(`/v1/nfts/collections/${collectionId}`);
};

export const fetchNftMutualsPreview = async (
  nftId: string,
): Promise<NftMutualsPreview> => {
  return await makeRequest(`/v1/nfts/${nftId}/mutuals-preview`);
};

export const fetchCollectionMutualsPreview = async (
  collectionId: string,
): Promise<NftMutualsPreview> => {
  return await makeRequest(
    `/v1/nfts/collections/${collectionId}/mutuals-preview`,
  );
};

export const fetchNftCollectionCollectors = async (
  req: GetNftCollectionCollectorsRequest,
  cursor?: string,
): Promise<FetchNftCollectorsResponse> => {
  return await makeRequest("/v1/nfts/collections/collectors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...req, cursor }),
  });
};

export const fetchNftCollectionFarcasterCollectors = async (
  req: GetNftCollectionCollectorsRequest,
  cursor?: string,
): Promise<FetchNftFarcasterCollectorsResponse> => {
  return await makeRequest("/v1/nfts/collections/collectors/farcaster", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...req, cursor }),
  });
};

export const fetchNftCollectionFollowingCollectors = async (
  req: GetNftCollectionCollectorsRequest,
  cursor?: string,
): Promise<FetchNftFarcasterCollectorsResponse> => {
  return await makeRequest("/v1/nfts/collections/collectors/following", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...req, cursor }),
  });
};

export const fetchCollectionNfts = async (
  collectionId: string,
  cursor?: string,
): Promise<FetchNftsResponse> => {
  return await makeRequest(
    `/v1/nfts/collections/${collectionId}/nfts${
      cursor ? `?cursor=${cursor}` : ""
    }`,
  );
};

export const fetchNftCollectors = async (
  req: GetNftCollectorsRequest,
  cursor?: string,
): Promise<FetchNftCollectorsResponse> => {
  return await makeRequest("/v1/nfts/collectors", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...req, cursor }),
  });
};

export const fetchNftFarcasterCollectors = async (
  req: GetNftCollectorsRequest,
  cursor?: string,
): Promise<FetchNftFarcasterCollectorsResponse> => {
  return await makeRequest("/v1/nfts/collectors/farcaster", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...req, cursor }),
  });
};

export const fetchNftFollowingCollectors = async (
  req: GetNftCollectorsRequest,
  cursor?: string,
): Promise<FetchNftFarcasterCollectorsResponse> => {
  return await makeRequest("/v1/nfts/collectors/following", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...req, cursor }),
  });
};

export const fetchNftCollectionEvents = async (
  req: GetNftCollectionEventsRequest,
  cursor?: string,
): Promise<FetchNftEventsResponse> => {
  return await makeRequest("/v1/nfts/collections/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...req, cursor }),
  });
};

export const fetchNftEvents = async (
  req: GetNftEventsRequest,
  cursor?: string,
): Promise<FetchNftEventsResponse> => {
  return await makeRequest("/v1/nfts/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...req, cursor }),
  });
};
