import { FarcasterCast, FarcasterFeedResponse } from "../../types";
import { makeRequest } from "../utils";
import {
  useQuery,
  InfiniteData,
  useInfiniteQuery,
} from "@tanstack/react-query";

export const fetchCast = async (hash: string) => {
  return await makeRequest(`/farcaster/casts/${hash}`);
};

export const useCast = (hash: string) => {
  return useQuery<FarcasterCast>({
    queryKey: ["cast", hash],
    queryFn: async () => {
      const cast = await fetchCast(hash);
      return cast;
    },
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

export const useCastReplies = (hash: string, mode: "best" | "new" | "top") => {
  return useInfiniteQuery<
    FarcasterFeedResponse,
    unknown,
    InfiniteData<FarcasterFeedResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["cast-replies", hash, mode],
    queryFn: async ({ pageParam }) => {
      const data = await fetchCastReplies(hash, mode, pageParam);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
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

export const useTrendingCasts = (viewerFid?: string) => {
  return useInfiniteQuery<
    FarcasterFeedResponse,
    unknown,
    InfiniteData<FarcasterFeedResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["trending"],
    queryFn: async ({ pageParam }) => {
      const data = await fetchTrendingCasts(viewerFid, pageParam);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });
};
