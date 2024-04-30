import {
  FarcasterFeedFilter,
  FarcasterFeedRequest,
  FetchCastsResponse,
} from "../../types";
import { makeRequest } from "../utils";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

export const fetchCastFeed = async (
  req: FarcasterFeedRequest,
  requestInit?: RequestInit,
): Promise<FetchCastsResponse> => {
  return await makeRequest("/farcaster/casts/feed", {
    ...requestInit,
    method: "POST",
    headers: {
      ...requestInit?.headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
};

export const useCastFeed = (
  filter: FarcasterFeedFilter,
  initialData?: FetchCastsResponse,
) => {
  return useInfiniteQuery<
    FetchCastsResponse,
    unknown,
    InfiniteData<FetchCastsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["castFeed", JSON.stringify(filter)],
    queryFn: async ({ pageParam }) => {
      const data = await fetchCastFeed({
        filter,
        cursor: pageParam,
      });
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

export const fetchCastReplies = async (
  hash: string,
  mode: "best" | "new" | "top",
  cursor?: string,
) => {
  return await makeRequest(
    `/farcaster/casts/${hash}/replies${mode !== "best" ? `/${mode}` : ""}${
      cursor ? `?cursor=${cursor}` : ""
    }`,
  );
};

export const useCastReplies = (
  hash: string,
  mode: "best" | "new" | "top",
  initialData?: FetchCastsResponse,
) => {
  return useInfiniteQuery<
    FetchCastsResponse,
    unknown,
    InfiniteData<FetchCastsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["cast-replies", hash, mode],
    queryFn: async ({ pageParam }) => {
      const data = await fetchCastReplies(hash, mode, pageParam);
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
    enabled: !initialData || !!initialData?.nextCursor,
    refetchOnWindowFocus: false,
  });
};

export const fetchTrendingCasts = async (
  viewerFid?: string,
  cursor?: string,
) => {
  return await makeRequest("/panels", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "default",
      key: "trending",
      context: {
        viewerFid,
      },
      cursor,
    }),
  });
};

export const useTrendingCasts = (
  viewerFid?: string,
  initialData?: FetchCastsResponse,
) => {
  return useInfiniteQuery<
    FetchCastsResponse,
    unknown,
    InfiniteData<FetchCastsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["trending"],
    queryFn: async ({ pageParam }) => {
      const data = await fetchTrendingCasts(viewerFid, pageParam);
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
