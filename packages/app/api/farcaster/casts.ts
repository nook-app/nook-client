import {
  FarcasterCast,
  FetchCastsResponse,
  FetchUsersResponse,
} from "../../types";
import { makeRequest } from "../utils";
import {
  useQueryClient,
  useQuery,
  InfiniteData,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { cacheRelatedData } from "./feed";

export const fetchCast = async (hash: string): Promise<FarcasterCast> => {
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
  const queryClient = useQueryClient();
  const initialData = queryClient.getQueryData<FarcasterCast>(["cast", hash]);
  return useQuery<FarcasterCast>({
    queryKey: ["cast", hash],
    queryFn: async () => {
      const cast = await fetchCast(hash);
      cacheRelatedData(queryClient, [cast]);
      return cast;
    },
    initialData,
    enabled: !initialData && !!hash,
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
  const queryClient = useQueryClient();
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
      for (const user of data.data) {
        queryClient.setQueryData(["user", user.username], user);
      }
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
  const queryClient = useQueryClient();
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
      for (const user of data.data) {
        queryClient.setQueryData(["user", user.username], user);
      }
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
  const queryClient = useQueryClient();
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
