import {
  FetchNotificationsResponse,
  GetNotificationsRequest,
  NotificationType,
} from "@nook/common/types";
import { makeRequest } from "../utils";
import { InfiniteData, useInfiniteQuery } from "@tanstack/react-query";

export const fetchNotifications = async (
  req: GetNotificationsRequest,
  cursor?: string,
): Promise<FetchNotificationsResponse> => {
  return makeRequest(`/notifications${cursor ? `?cursor=${cursor}` : ""}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
};

export const usePriorityNotifications = (
  fid: string,
  initialData?: FetchNotificationsResponse,
) => {
  return useInfiniteQuery<
    FetchNotificationsResponse,
    unknown,
    InfiniteData<FetchNotificationsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["notifications-priority", fid],
    queryFn: async ({ pageParam }) => {
      const data = await fetchNotifications({ fid, priority: true }, pageParam);
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

export const useMentionsNotifications = (
  fid: string,
  initialData?: FetchNotificationsResponse,
) => {
  return useInfiniteQuery<
    FetchNotificationsResponse,
    unknown,
    InfiniteData<FetchNotificationsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["notifications-mentions", fid],
    queryFn: async ({ pageParam }) => {
      const data = await fetchNotifications(
        { fid, types: ["MENTION", "QUOTE", "REPLY"] },
        pageParam,
      );
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

export const useAllNotifications = (
  fid: string,
  types?: NotificationType[],
  initialData?: FetchNotificationsResponse,
) => {
  return useInfiniteQuery<
    FetchNotificationsResponse,
    unknown,
    InfiniteData<FetchNotificationsResponse>,
    string[],
    string | undefined
  >({
    queryKey: ["notifications-all", fid, JSON.stringify(types)],
    queryFn: async ({ pageParam }) => {
      const data = await fetchNotifications(
        { fid, types: types && types.length > 0 ? types : undefined },
        pageParam,
      );
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
