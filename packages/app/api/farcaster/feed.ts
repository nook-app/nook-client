import {
  Channel,
  FarcasterFeedFilter,
  FarcasterFeedRequest,
  FetchCastsResponse,
} from "@nook/common/types";
import { makeRequest } from "../utils";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useUserStore } from "../../store/useUserStore";
import { useChannelStore } from "../../store/useChannelStore";
import { useCastStore } from "../../store/useCastStore";

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
  api?: string,
  initialData?: FetchCastsResponse,
) => {
  const addUsers = useUserStore((state) => state.addUsers);
  const addChannels = useChannelStore((state) => state.addChannels);
  const addCasts = useCastStore((state) => state.addCasts);
  return useInfiniteQuery<
    FetchCastsResponse,
    unknown,
    InfiniteData<FetchCastsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["castFeed", JSON.stringify(filter)],
    queryFn: async ({ pageParam }) => {
      console.log("yo");
      const data = await fetchCastFeed({
        api,
        filter,
        cursor: pageParam,
      });
      const users = data.data.map((cast) => cast.user);
      addUsers(users);
      const channels = data.data
        .map((cast) => cast.channel)
        .filter(Boolean) as Channel[];
      addChannels(channels);
      const casts = data.data.map((cast) => cast);
      addCasts(casts);
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
): Promise<FetchCastsResponse> => {
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
  const addUsers = useUserStore((state) => state.addUsers);
  const addChannels = useChannelStore((state) => state.addChannels);
  const addCasts = useCastStore((state) => state.addCasts);
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
      const users = data.data.map((cast) => cast.user);
      addUsers(users);
      const channels = data.data
        .map((cast) => cast.channel)
        .filter(Boolean) as Channel[];
      addChannels(channels);
      const casts = data.data.map((cast) => cast);
      addCasts(casts);
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
): Promise<FetchCastsResponse> => {
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
  const addUsers = useUserStore((state) => state.addUsers);
  const addChannels = useChannelStore((state) => state.addChannels);
  const addCasts = useCastStore((state) => state.addCasts);
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
      const users = data.data.map((cast) => cast.user);
      addUsers(users);
      const channels = data.data
        .map((cast) => cast.channel)
        .filter(Boolean) as Channel[];
      addChannels(channels);
      const casts = data.data.map((cast) => cast);
      addCasts(casts);
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
