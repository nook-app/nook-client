import {
  FarcasterCastV1,
  FetchCastsResponse,
  FetchUsersResponse,
} from "@nook/common/types";
import {
  useQuery,
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useQueryClient,
} from "@tanstack/react-query";
import { useCastStore } from "../../store/useCastStore";
import { useUserStore } from "../../store/useUserStore";
import { useChannelStore } from "../../store/useChannelStore";
import { useState } from "react";
import {
  fetchCast,
  fetchCastLikes,
  fetchCastQuotes,
  fetchCastRecasts,
} from "../../api/farcaster";

export const useCast = (hash: string) => {
  const addCasts = useCastStore((state) => state.addCasts);
  return useQuery<FarcasterCastV1>({
    queryKey: ["cast", hash],
    queryFn: async () => {
      const cast = await fetchCast(hash);
      addCasts([cast]);
      return cast;
    },
  });
};

export const useCastLikes = (
  hash: string,
  initialData?: FetchUsersResponse,
): UseInfiniteQueryResult<InfiniteData<FetchUsersResponse>, unknown> & {
  refresh: () => Promise<void>;
} => {
  const [isRefetching, setIsRefetching] = useState(false);
  const queryClient = useQueryClient();

  const addUsers = useUserStore((state) => state.addUsers);

  const queryKey = ["cast-likes", hash];

  const props = useInfiniteQuery<
    FetchUsersResponse,
    unknown,
    InfiniteData<FetchUsersResponse>,
    string[],
    string | undefined
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const data = await fetchCastLikes(hash, pageParam);
      addUsers(data.data);
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

export const useCastRecasts = (
  hash: string,
  initialData?: FetchUsersResponse,
): UseInfiniteQueryResult<InfiniteData<FetchUsersResponse>, unknown> & {
  refresh: () => Promise<void>;
} => {
  const [isRefetching, setIsRefetching] = useState(false);
  const queryClient = useQueryClient();

  const addUsers = useUserStore((state) => state.addUsers);

  const queryKey = ["cast-recasts", hash];

  const props = useInfiniteQuery<
    FetchUsersResponse,
    unknown,
    InfiniteData<FetchUsersResponse>,
    string[],
    string | undefined
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const data = await fetchCastRecasts(hash, pageParam);
      addUsers(data.data);
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

  const refresh = async () => {
    setIsRefetching(true);
    queryClient.setQueryData<InfiniteData<FetchUsersResponse>>(
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

export const useCastQuotes = (
  hash: string,
  initialData?: FetchCastsResponse,
): UseInfiniteQueryResult<InfiniteData<FetchCastsResponse>, unknown> & {
  refresh: () => Promise<void>;
} => {
  const [isRefetching, setIsRefetching] = useState(false);
  const queryClient = useQueryClient();

  const addCastsFromCasts = useCastStore((state) => state.addCastsFromCasts);
  const addUsersFromCasts = useUserStore((state) => state.addUsersFromCasts);
  const addChannelsFromCasts = useChannelStore(
    (state) => state.addChannelsFromCasts,
  );

  const queryKey = ["cast-quotes", hash];

  const props = useInfiniteQuery<
    FetchCastsResponse,
    unknown,
    InfiniteData<FetchCastsResponse>,
    string[],
    string | undefined
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const data = await fetchCastQuotes(hash, pageParam);
      addCastsFromCasts(data.data);
      addUsersFromCasts(data.data);
      addChannelsFromCasts(data.data);
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
