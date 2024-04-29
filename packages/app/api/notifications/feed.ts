import {
  FarcasterCast,
  FarcasterUser,
  FetchNotificationsResponse,
  GetNotificationsRequest,
  NotificationResponse,
  NotificationType,
} from "../../types";
import { hasCastDiff, hasUserDiff, makeRequest } from "../utils";
import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
  QueryClient,
} from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
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

export const useMentionsNotifications = (
  fid: string,
  initialData?: FetchNotificationsResponse,
) => {
  const queryClient = useQueryClient();
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

export const useAllNotifications = (
  fid: string,
  types?: NotificationType[],
  initialData?: FetchNotificationsResponse,
) => {
  const queryClient = useQueryClient();
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

const cacheRelatedData = (
  queryClient: QueryClient,
  notifications: NotificationResponse[],
) => {
  for (const notification of notifications) {
    if (notification.cast) {
      const existingCast = queryClient.getQueryData<FarcasterCast>([
        "cast",
        notification.cast.hash,
      ]);
      if (!existingCast || hasCastDiff(existingCast, notification.cast)) {
        queryClient.setQueryData(
          ["cast", notification.cast.hash],
          notification.cast,
        );
      }
      for (const user of notification.users || []) {
        const existingUser = queryClient.getQueryData<FarcasterUser>([
          "user",
          user.fid,
        ]);
        if (!existingUser || hasUserDiff(existingUser, user)) {
          queryClient.setQueryData(["user", user.fid], user);
        }
      }
    }
  }
};
