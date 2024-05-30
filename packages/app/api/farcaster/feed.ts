import {
  FarcasterFeedFilter,
  FarcasterFeedRequest,
  FetchCastsResponse,
} from "@nook/common/types";
import { makeRequest } from "../utils";
import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useUserStore } from "../../store/useUserStore";
import { useChannelStore } from "../../store/useChannelStore";
import { useCastStore } from "../../store/useCastStore";

export const fetchCastFeed = async (
  req: FarcasterFeedRequest,
  requestInit?: RequestInit,
): Promise<FetchCastsResponse> => {
  return await makeRequest("/farcaster/casts", {
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
  const addUsersFromCasts = useUserStore((state) => state.addUsersFromCasts);
  const addChannelsFromCasts = useChannelStore(
    (state) => state.addChannelsFromCasts,
  );
  const addCastsFromCasts = useCastStore((state) => state.addCastsFromCasts);

  const queryClient = useQueryClient();
  const cachedData = queryClient.getQueryData<
    InfiniteData<FetchCastsResponse, string>
  >(["castFeed", JSON.stringify(filter), api || ""]);

  return useInfiniteQuery<
    FetchCastsResponse,
    unknown,
    InfiniteData<FetchCastsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["castFeed", JSON.stringify(filter), api || ""],
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
      : cachedData,
    enabled: !cachedData,
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
  const addUsersFromCasts = useUserStore((state) => state.addUsersFromCasts);
  const addChannelsFromCasts = useChannelStore(
    (state) => state.addChannelsFromCasts,
  );
  const addCastsFromCasts = useCastStore((state) => state.addCastsFromCasts);
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
};
