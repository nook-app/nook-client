import {
  FarcasterUser,
  FetchNftCollectionsResponse,
  FetchNftCollectorsResponse,
  FetchNftFarcasterCollectorsResponse,
  FetchNftsResponse,
  GetNftCollectorsRequest,
  NftFeedFilter,
  NftMutualsPreview,
  SimpleHashCollection,
} from "@nook/common/types";
import { makeRequest } from "../utils";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useNftStore } from "../../store/useNftStore";
import { useUserStore } from "../../store/useUserStore";

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

export const useNftFeed = (
  filter: NftFeedFilter,
  initialData?: FetchNftsResponse,
) => {
  const addNfts = useNftStore((state) => state.addNfts);
  return useInfiniteQuery<
    FetchNftsResponse,
    unknown,
    InfiniteData<FetchNftsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["nftFeed", JSON.stringify(filter)],
    queryFn: async ({ pageParam }) => {
      const data = await fetchNftFeed(filter, pageParam);
      addNfts(data.data);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    initialPageParam: initialData?.nextCursor,
    refetchOnWindowFocus: false,
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

export const useNftCollectionFeed = (
  filter: NftFeedFilter,
  initialData?: FetchNftCollectionsResponse,
) => {
  const addCollections = useNftStore((state) => state.addCollections);
  return useInfiniteQuery<
    FetchNftCollectionsResponse,
    unknown,
    InfiniteData<FetchNftCollectionsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["nftCollectionFeed", JSON.stringify(filter)],
    queryFn: async ({ pageParam }) => {
      const data = await fetchNftCollectionFeed(filter, pageParam);
      addCollections(
        data.data.map((collection) => collection.collection_details),
      );
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    initialPageParam: initialData?.nextCursor,
    refetchOnWindowFocus: false,
  });
};

export const fetchNft = async (nftId: string) => {
  return await makeRequest(`/v1/nfts/${nftId}`);
};

export const fetchNftCollection = async (
  collectionId: string,
): Promise<SimpleHashCollection> => {
  return await makeRequest(`/v1/nfts/collections/${collectionId}`);
};

export const fetchCollectionMutualsPreview = async (
  collectionId: string,
): Promise<NftMutualsPreview> => {
  return await makeRequest(
    `/v1/nfts/collections/${collectionId}/mutuals-preview`,
  );
};

export const fetchNftCollectionCollectors = async (
  req: GetNftCollectorsRequest,
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

export const useNFtCollectionCollectors = (
  req: GetNftCollectorsRequest,
  initialData?: FetchNftCollectorsResponse,
) => {
  return useInfiniteQuery<
    FetchNftCollectorsResponse,
    unknown,
    InfiniteData<FetchNftCollectorsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["nftCollectionCollectors", JSON.stringify(req)],
    queryFn: async ({ pageParam }) => {
      const data = await fetchNftCollectionCollectors(req, pageParam);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    initialPageParam: initialData?.nextCursor,
  });
};

export const fetchNftCollectionFarcasterCollectors = async (
  req: GetNftCollectorsRequest,
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

export const useNFtCollectionFarcasterCollectors = (
  req: GetNftCollectorsRequest,
  initialData?: FetchNftFarcasterCollectorsResponse,
) => {
  const addUsers = useUserStore((state) => state.addUsers);
  return useInfiniteQuery<
    FetchNftFarcasterCollectorsResponse,
    unknown,
    InfiniteData<FetchNftFarcasterCollectorsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["nftCollectionCollectorsFarcaster", JSON.stringify(req)],
    queryFn: async ({ pageParam }) => {
      const data = await fetchNftCollectionFarcasterCollectors(req, pageParam);
      const users = data.data
        .filter((collector) => collector.user)
        .map((collector) => collector.user) as FarcasterUser[];
      addUsers(users);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    initialPageParam: initialData?.nextCursor,
  });
};

export const fetchNftCollectionFollowingCollectors = async (
  req: GetNftCollectorsRequest,
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

export const useNFtCollectionFollowingCollectors = (
  req: GetNftCollectorsRequest,
  initialData?: FetchNftFarcasterCollectorsResponse,
) => {
  const addUsers = useUserStore((state) => state.addUsers);
  return useInfiniteQuery<
    FetchNftFarcasterCollectorsResponse,
    unknown,
    InfiniteData<FetchNftFarcasterCollectorsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["nftCollectionCollectorsFollowing", JSON.stringify(req)],
    queryFn: async ({ pageParam }) => {
      const data = await fetchNftCollectionFollowingCollectors(req, pageParam);
      const users = data.data
        .filter((collector) => collector.user)
        .map((collector) => collector.user) as FarcasterUser[];
      addUsers(users);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    initialPageParam: initialData?.nextCursor,
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

export const useCollectionNfts = (
  collectionId: string,
  initialData?: FetchNftsResponse,
) => {
  const addNfts = useNftStore((state) => state.addNfts);
  return useInfiniteQuery<
    FetchNftsResponse,
    unknown,
    InfiniteData<FetchNftsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["nftCollectionNfts", collectionId],
    queryFn: async ({ pageParam }) => {
      const data = await fetchCollectionNfts(collectionId, pageParam);
      addNfts(data.data);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [undefined],
        }
      : undefined,
    initialPageParam: initialData?.nextCursor,
    refetchOnWindowFocus: false,
  });
};
