import {
  FarcasterCastResponse,
  FetchCastsResponse,
  FetchUsersResponse,
} from "@nook/common/types";
import { makeRequest } from "../utils";
import {
  useQuery,
  InfiniteData,
  useInfiniteQuery,
} from "@tanstack/react-query";

export const fetchCast = async (
  hash: string,
): Promise<FarcasterCastResponse> => {
  return await makeRequest(`/farcaster/casts/${hash}`);
};

export const fetchCasts = async (hashes: string[]) => {
  return await makeRequest("/farcaster/casts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ hashes }),
  });
};

export const useCast = (hash: string) => {
  return useQuery<FarcasterCastResponse>({
    queryKey: ["cast", hash],
    queryFn: async () => {
      const cast = await fetchCast(hash);
      return cast;
    },
  });
};

export const fetchCastLikes = async (hash: string, cursor?: string) => {
  return await makeRequest(
    `/farcaster/casts/${hash}/likes${cursor ? `?cursor=${cursor}` : ""}`,
  );
};

export const useCastLikes = (
  hash: string,
  initialData?: FetchUsersResponse,
) => {
  return useInfiniteQuery<
    FetchUsersResponse,
    unknown,
    InfiniteData<FetchUsersResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["cast-likes", hash],
    queryFn: async ({ pageParam }) => {
      const data = await fetchCastLikes(hash, pageParam);
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

export const fetchCastRecasts = async (hash: string, cursor?: string) => {
  return await makeRequest(
    `/farcaster/casts/${hash}/recasts${cursor ? `?cursor=${cursor}` : ""}`,
  );
};

export const useCastRecasts = (
  hash: string,
  initialData?: FetchUsersResponse,
) => {
  return useInfiniteQuery<
    FetchUsersResponse,
    unknown,
    InfiniteData<FetchUsersResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["cast-recasts", hash],
    queryFn: async ({ pageParam }) => {
      const data = await fetchCastRecasts(hash, pageParam);
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

export const fetchCastQuotes = async (hash: string, cursor?: string) => {
  return await makeRequest(
    `/farcaster/casts/${hash}/quotes${cursor ? `?cursor=${cursor}` : ""}`,
  );
};

export const useCastQuotes = (
  hash: string,
  initialData?: FetchCastsResponse,
) => {
  return useInfiniteQuery<
    FetchCastsResponse,
    unknown,
    InfiniteData<FetchCastsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["cast-quotes", hash],
    queryFn: async ({ pageParam }) => {
      const data = await fetchCastQuotes(hash, pageParam);
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
