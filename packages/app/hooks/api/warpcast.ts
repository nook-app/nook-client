import { FetchCastActionsResponse } from "@nook/common/types";
import {
  InfiniteData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";
import {
  fetchChannelFollowingStatus,
  getFarcasterActions,
} from "../../api/warpcast";

export const useFarcasterActions = (initialData?: FetchCastActionsResponse) => {
  return useInfiniteQuery<
    FetchCastActionsResponse,
    unknown,
    InfiniteData<FetchCastActionsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["actions"],
    queryFn: async ({ pageParam }) => {
      const data = await getFarcasterActions(pageParam);
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

export const useChannelFollowingStatus = (channelId: string, fid?: string) => {
  return useQuery({
    queryKey: ["channel-following", fid, channelId],
    queryFn: async () => {
      if (!fid) return;
      return await fetchChannelFollowingStatus(fid, channelId);
    },
    enabled: !!fid,
  });
};
