import {
  FarcasterCast,
  FarcasterFeedFilter,
  FarcasterFeedRequest,
  FetchCastsResponse,
  FarcasterUser,
  Channel,
} from "../../types";
import {
  hasCastDiff,
  hasChannelDiff,
  hasUserDiff,
  makeRequest,
} from "../utils";
import {
  InfiniteData,
  useInfiniteQuery,
  QueryClient,
  useQueryClient,
} from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
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
      cacheRelatedData(queryClient, data.data);
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
  const queryClient = useQueryClient();
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
      cacheRelatedData(queryClient, data.data);
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
  const queryClient = useQueryClient();
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
      cacheRelatedData(queryClient, data.data);
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

export const cacheRelatedData = (
  queryClient: QueryClient,
  casts: FarcasterCast[],
) => {
  for (const cast of casts) {
    const existingCast = queryClient.getQueryData<FarcasterCast>([
      "cast",
      cast.hash,
    ]);
    if (!existingCast || hasCastDiff(existingCast, cast)) {
      queryClient.setQueryData(["cast", cast.hash], cast);
    }

    const existingUser = queryClient.getQueryData<FarcasterUser>([
      "user",
      cast.user.username,
    ]);
    if (!existingUser || hasUserDiff(existingUser, cast.user)) {
      queryClient.setQueryData(["user", cast.user.username], cast.user);
    }

    for (const mention of cast.mentions) {
      const existingUser = queryClient.getQueryData<FarcasterUser>([
        "user",
        mention.user.username,
      ]);
      if (!existingUser || hasUserDiff(existingUser, mention.user)) {
        queryClient.setQueryData(["user", mention.user.username], mention.user);
      }
    }

    if (cast.channel) {
      const existingChannel = queryClient.getQueryData<Channel>([
        "channel",
        cast.channel.channelId,
      ]);
      if (!existingChannel || hasChannelDiff(existingChannel, cast.channel)) {
        queryClient.setQueryData(
          ["channel", cast.channel.channelId],
          cast.channel,
        );
      }
    }

    for (const embed of cast.embedCasts) {
      const existingCast = queryClient.getQueryData<FarcasterCast>([
        "cast",
        embed.hash,
      ]);
      if (!existingCast || hasCastDiff(existingCast, embed)) {
        queryClient.setQueryData(["cast", embed.hash], embed);
      }
    }

    if (cast.parent) {
      const existingCast = queryClient.getQueryData<FarcasterCast>([
        "cast",
        cast.parent.hash,
      ]);
      if (!existingCast || hasCastDiff(existingCast, cast.parent)) {
        queryClient.setQueryData(["cast", cast.parent.hash], cast.parent);
      }

      const existingUser = queryClient.getQueryData<FarcasterUser>([
        "user",
        cast.parent.user.username,
      ]);
      if (!existingUser || hasUserDiff(existingUser, cast.parent.user)) {
        queryClient.setQueryData(
          ["user", cast.parent.user.username],
          cast.parent.user,
        );
      }

      for (const mention of cast.parent.mentions) {
        const existingUser = queryClient.getQueryData<FarcasterUser>([
          "user",
          mention.user.username,
        ]);
        if (!existingUser || hasUserDiff(existingUser, mention.user)) {
          queryClient.setQueryData(
            ["user", mention.user.username],
            mention.user,
          );
        }
      }

      if (cast.parent.channel) {
        const existingChannel = queryClient.getQueryData<Channel>([
          "channel",
          cast.parent.channel.channelId,
        ]);
        if (
          !existingChannel ||
          hasChannelDiff(existingChannel, cast.parent.channel)
        ) {
          queryClient.setQueryData(
            ["channel", cast.parent.channel.channelId],
            cast.parent.channel,
          );
        }
      }

      for (const embed of cast.parent.embedCasts) {
        const existingCast = queryClient.getQueryData<FarcasterCast>([
          "cast",
          embed.hash,
        ]);
        if (!existingCast || hasCastDiff(existingCast, embed)) {
          queryClient.setQueryData(["cast", embed.hash], embed);
        }
      }
    }
  }
};
