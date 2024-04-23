import {
  FarcasterCast,
  FarcasterFeedFilter,
  FarcasterFeedRequest,
  FarcasterFeedResponse,
} from "../../types";
import { makeRequest } from "../utils";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

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
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    staleTime: Infinity,
  });
};
