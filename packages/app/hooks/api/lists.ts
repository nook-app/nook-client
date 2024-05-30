import { FetchListsResponse, GetListsRequest } from "@nook/common/types";
import {
  InfiniteData,
  UseInfiniteQueryResult,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useUserStore } from "../../store/useUserStore";
import { useChannelStore } from "../../store/useChannelStore";
import { useListStore } from "../../store/useListStore";
import { useState } from "react";
import { fetchFollowedLists } from "../../api/list";

export const useFollowedLists = (
  req: GetListsRequest,
  initialData?: FetchListsResponse,
): UseInfiniteQueryResult<InfiniteData<FetchListsResponse>, unknown> & {
  refresh: () => Promise<void>;
} => {
  const [isRefetching, setIsRefetching] = useState(false);
  const queryClient = useQueryClient();

  const addUsersFromLists = useUserStore((state) => state.addUsersFromLists);
  const addChannelsFromLists = useChannelStore(
    (state) => state.addChannelsFromLists,
  );
  const addLists = useListStore((state) => state.addLists);

  const queryKey = ["followedUserLists", req.type];

  const props = useInfiniteQuery<
    FetchListsResponse,
    unknown,
    InfiniteData<FetchListsResponse>,
    string[],
    string | undefined
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const data = await fetchFollowedLists({ ...req, cursor: pageParam });
      addUsersFromLists(data.data);
      addChannelsFromLists(data.data);
      addLists(data.data);
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
    queryClient.setQueryData<InfiniteData<FetchListsResponse>>(
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
