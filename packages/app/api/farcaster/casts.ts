import {
  FarcasterCastV1,
  FetchCastsResponse,
  FetchUsersResponse,
} from "@nook/common/types";
import { makeRequest } from "../utils";
import {
  useQuery,
  InfiniteData,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { useCastStore } from "../../store/useCastStore";
import { useUserStore } from "../../store/useUserStore";
import { useChannelStore } from "../../store/useChannelStore";

export const fetchCast = async (hash: string): Promise<FarcasterCastV1> => {
  return await makeRequest(`/farcaster/casts/${hash}`);
};

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

export const fetchCastLikes = async (hash: string, cursor?: string) => {
  return await makeRequest(
    `/farcaster/casts/${hash}/likes${cursor ? `?cursor=${cursor}` : ""}`,
  );
};

export const useCastLikes = (
  hash: string,
  initialData?: FetchUsersResponse,
) => {
  const addUsers = useUserStore((state) => state.addUsers);
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
  const addUsers = useUserStore((state) => state.addUsers);
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
  const addCastsFromCasts = useCastStore((state) => state.addCastsFromCasts);
  const addUsersFromCasts = useUserStore((state) => state.addUsersFromCasts);
  const addChannelsFromCasts = useChannelStore(
    (state) => state.addChannelsFromCasts,
  );
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
};
