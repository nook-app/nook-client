import {
  CreateListRequest,
  FetchListsResponse,
  GetListsRequest,
  List,
  ListItem,
  UpdateListRequest,
} from "@nook/common/types";
import { makeRequest } from "../utils";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";
import { useUserStore } from "../../store/useUserStore";
import { useChannelStore } from "../../store/useChannelStore";
import { useListStore } from "../../store/useListStore";

export const fetchFollowedLists = async (
  req: GetListsRequest,
): Promise<FetchListsResponse> => {
  return await makeRequest("/v1/lists/followed", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
};

export const useFollowedLists = (
  req: GetListsRequest,
  initialData?: FetchListsResponse,
) => {
  const addUsersFromLists = useUserStore((state) => state.addUsersFromLists);
  const addChannelsFromLists = useChannelStore(
    (state) => state.addChannelsFromLists,
  );
  const addLists = useListStore((state) => state.addLists);

  return useInfiniteQuery<
    FetchListsResponse,
    unknown,
    InfiniteData<FetchListsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["followedUserLists", req.type],
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
};

export const createList = async (req: CreateListRequest): Promise<List> => {
  return await makeRequest("/v1/lists", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
};

export const updateList = async (
  listId: string,
  req: UpdateListRequest,
): Promise<List> => {
  return await makeRequest(`/v1/lists/${listId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
};

export const deleteList = async (listId: string): Promise<void> => {
  return await makeRequest(`/v1/lists/${listId}`, {
    method: "DELETE",
  });
};

export const fetchList = async (listId: string): Promise<List> => {
  return await makeRequest(`/v1/lists/${listId}`);
};

export const addToList = async (
  listId: string,
  item: ListItem,
): Promise<void> => {
  return await makeRequest(`/v1/lists/${listId}/items`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });
};

export const removeFromList = async (
  listId: string,
  item: ListItem,
): Promise<void> => {
  return await makeRequest(`/v1/lists/${listId}/items`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
  });
};