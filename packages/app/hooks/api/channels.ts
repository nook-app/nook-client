import { Channel, FetchChannelsResponse } from "@nook/common/types";
import {
  useQuery,
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQueryClient,
} from "@tanstack/react-query";
import { useChannelStore } from "../../store/useChannelStore";
import { useState } from "react";
import {
  fetchChannel,
  fetchChannelUrls,
  fetchChannels,
  fetchRecommendedChannels,
  searchChannels,
} from "../../api/farcaster";

export const useChannel = (channelId: string) => {
  const addChannels = useChannelStore((state) => state.addChannels);
  return useQuery<Channel>({
    queryKey: ["channel", channelId],
    queryFn: async () => {
      const channel = await fetchChannel(channelId);
      addChannels([channel]);
      return channel;
    },
    enabled: !!channelId,
  });
};

export const useRecommendedChannels = () => {
  const addChannels = useChannelStore((state) => state.addChannels);
  return useQuery<FetchChannelsResponse>({
    queryKey: ["channels", "recommended"],
    queryFn: async () => {
      const channels = await fetchRecommendedChannels();
      addChannels(channels.data);
      return channels;
    },
  });
};

export const useSearchChannels = (
  query: string,
  limit?: number,
  initialData?: FetchChannelsResponse,
): UseInfiniteQueryResult<InfiniteData<FetchChannelsResponse>, unknown> & {
  refresh: () => Promise<void>;
} => {
  const [isRefetching, setIsRefetching] = useState(false);
  const queryClient = useQueryClient();

  const addChannels = useChannelStore((state) => state.addChannels);

  const queryKey = ["channels", "search", limit?.toString() || "", query];

  const props = useInfiniteQuery<
    FetchChannelsResponse,
    unknown,
    InfiniteData<FetchChannelsResponse>,
    string[],
    string | undefined
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const data = await searchChannels(query, pageParam, limit);
      addChannels(data.data);
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
    enabled: !!query,
  });

  const refresh = async () => {
    setIsRefetching(true);
    queryClient.setQueryData<InfiniteData<FetchChannelsResponse>>(
      queryKey,
      (data) => {
        if (!data) return undefined;
        return {
          pages: data.pages.slice(0, 1),
          pageParams: data.pageParams.slice(0, 1),
        };
      },
    );
    await props.refetch();
    setIsRefetching(false);
  };

  return { ...props, refresh, isRefetching };
};

export const useChannels = (channelIds: string[]) => {
  const addChannels = useChannelStore((state) => state.addChannels);
  return useQuery<FetchChannelsResponse>({
    queryKey: ["channels", channelIds.join(",")],
    queryFn: async () => {
      const channels = await fetchChannels(channelIds);
      addChannels(channels.data);
      return channels;
    },
    enabled: channelIds.length > 0,
  });
};

export const useChannelUrls = (urls: string[]) => {
  const addChannels = useChannelStore((state) => state.addChannels);
  return useQuery<FetchChannelsResponse>({
    queryKey: ["channels", urls.join(",")],
    queryFn: async () => {
      const channels = await fetchChannelUrls(urls);
      addChannels(channels.data);
      return channels;
    },
    enabled: urls.length > 0,
  });
};
