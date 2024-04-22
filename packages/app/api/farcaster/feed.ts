import {
  Channel,
  FarcasterCast,
  FarcasterFeedFilter,
  FarcasterFeedRequest,
  FarcasterUser,
} from "../../types";
import { makeRequest } from "../utils";
import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";

type FarcasterFeedResponse = {
  data: FarcasterCast[];
  nextCursor?: string;
};

export const hasUserDiff = (user1: FarcasterUser, user2: FarcasterUser) => {
  return (
    user1.engagement.followers !== user2.engagement.followers ||
    user1.engagement.following !== user2.engagement.following
  );
};

export const hasChannelDiff = (channel1: Channel, channel2: Channel) => {
  return false;
};

export const hasCastDiff = (cast1: FarcasterCast, cast2: FarcasterCast) => {
  return (
    cast1.engagement.likes !== cast2.engagement.likes ||
    cast1.engagement.recasts !== cast2.engagement.recasts ||
    cast1.engagement.replies !== cast2.engagement.replies ||
    cast1.engagement.quotes !== cast2.engagement.quotes
  );
};

export const fetchCastFeed = async (
  req: FarcasterFeedRequest,
  requestInit?: RequestInit,
): Promise<FarcasterFeedResponse> => {
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

export const useCastFeed = (filter: FarcasterFeedFilter) => {
  const queryClient = useQueryClient();
  return useInfiniteQuery<
    FarcasterFeedResponse,
    unknown,
    InfiniteData<FarcasterFeedResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["castFeed", JSON.stringify(filter)],
    queryFn: async ({ pageParam }) => {
      const data = await fetchCastFeed({
        filter,
        context: {
          viewerFid: "3887",
        },
        cursor: pageParam,
      });
      if (data?.data) {
        for (const cast of data.data) {
          const existingCast = queryClient.getQueryData<FarcasterCast>([
            "cast",
            cast.hash,
          ]);
          if (!existingCast || hasCastDiff(existingCast, cast)) {
            queryClient.setQueryData(["cast", cast.hash], cast);
          }

          const existingUser = queryClient.getQueryData<FarcasterUser>([
            "user",
            cast.user.fid,
          ]);
          if (!existingUser || hasUserDiff(existingUser, cast.user)) {
            queryClient.setQueryData(["user", cast.user.fid], cast.user);
          }

          for (const mention of cast.mentions) {
            const existingUser = queryClient.getQueryData<FarcasterUser>([
              "user",
              mention.user.fid,
            ]);
            if (!existingUser || hasUserDiff(existingUser, mention.user)) {
              queryClient.setQueryData(
                ["user", mention.user.fid],
                mention.user,
              );
            }
          }

          if (cast.channel) {
            const existingChannel = queryClient.getQueryData<Channel>([
              "channel",
              cast.channel.channelId,
            ]);
            if (
              !existingChannel ||
              hasChannelDiff(existingChannel, cast.channel)
            ) {
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
              cast.parent.user.fid,
            ]);
            if (!existingUser || hasUserDiff(existingUser, cast.parent.user)) {
              queryClient.setQueryData(
                ["user", cast.parent.user.fid],
                cast.parent.user,
              );
            }

            for (const mention of cast.parent.mentions) {
              const existingUser = queryClient.getQueryData<FarcasterUser>([
                "user",
                mention.user.fid,
              ]);
              if (!existingUser || hasUserDiff(existingUser, mention.user)) {
                queryClient.setQueryData(
                  ["user", mention.user.fid],
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
      }
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });
};
