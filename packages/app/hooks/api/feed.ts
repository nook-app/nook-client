import { FarcasterFeedFilter, FetchCastsResponse } from "@nook/common/types";
import {
  InfiniteData,
  UseInfiniteQueryResult,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useUserStore } from "../../store/useUserStore";
import { useChannelStore } from "../../store/useChannelStore";
import { useCastStore } from "../../store/useCastStore";
import { useState } from "react";
import { fetchCastFeed, fetchCastReplies } from "../../api/farcaster";

export const useCastFeed = (
  filter: FarcasterFeedFilter,
  api?: string,
  initialData?: FetchCastsResponse,
): UseInfiniteQueryResult<InfiniteData<FetchCastsResponse>, unknown> & {
  refresh: () => Promise<void>;
} => {
  const [isRefetching, setIsRefetching] = useState(false);
  const queryClient = useQueryClient();

  const addUsersFromCasts = useUserStore((state) => state.addUsersFromCasts);
  const addChannelsFromCasts = useChannelStore(
    (state) => state.addChannelsFromCasts,
  );
  const addCastsFromCasts = useCastStore((state) => state.addCastsFromCasts);

  const queryKey = ["castFeed", JSON.stringify(filter), api || ""];

  const props = useInfiniteQuery<
    FetchCastsResponse,
    unknown,
    InfiniteData<FetchCastsResponse>,
    string[],
    string | undefined
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const data = await fetchCastFeed({
        api,
        filter,
        cursor: pageParam,
      });
      addUsersFromCasts(data.data);
      addChannelsFromCasts(data.data);
      addCastsFromCasts(data.data);
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

  const refresh = async () => {
    setIsRefetching(true);
    queryClient.setQueryData<InfiniteData<FetchCastsResponse>>(
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

export const useCastReplies = (
  hash: string,
  mode: "best" | "new" | "top",
  initialData?: FetchCastsResponse,
): UseInfiniteQueryResult<InfiniteData<FetchCastsResponse>, unknown> & {
  refresh: () => Promise<void>;
} => {
  const [isRefetching, setIsRefetching] = useState(false);
  const queryClient = useQueryClient();

  const addUsersFromCasts = useUserStore((state) => state.addUsersFromCasts);
  const addChannelsFromCasts = useChannelStore(
    (state) => state.addChannelsFromCasts,
  );
  const addCastsFromCasts = useCastStore((state) => state.addCastsFromCasts);

  const queryKey = ["cast-replies", hash, mode];

  const props = useInfiniteQuery<
    FetchCastsResponse,
    unknown,
    InfiniteData<FetchCastsResponse>,
    string[],
    string | undefined
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const data = await fetchCastReplies(hash, mode, pageParam);
      addUsersFromCasts(data.data);
      addChannelsFromCasts(data.data);
      addCastsFromCasts(data.data);
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

  const refresh = async () => {
    setIsRefetching(true);
    queryClient.setQueryData<InfiniteData<FetchCastsResponse>>(
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
