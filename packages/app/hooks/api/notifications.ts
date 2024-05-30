import {
  fetchNotifications,
  fetchNotificationsCount,
} from "../../api/notifications";
import {
  FetchNotificationsResponse,
  NotificationType,
} from "@nook/common/types";
import {
  InfiniteData,
  UseInfiniteQueryResult,
  useInfiniteQuery,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import { useCastStore } from "../../store/useCastStore";
import { useUserStore } from "../../store/useUserStore";
import { useChannelStore } from "../../store/useChannelStore";
import { useState } from "react";

export const useNotificationsCount = (fid?: string) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["notifications-count"],
    queryFn: async () => {
      const data = await fetchNotificationsCount();
      if (data.count > 0 && fid) {
        queryClient.invalidateQueries({
          queryKey: ["notifications-priority", fid],
        });
      }
      return data;
    },
    enabled: !!fid,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const usePriorityNotifications = (
  fid: string,
  initialData?: FetchNotificationsResponse,
): UseInfiniteQueryResult<InfiniteData<FetchNotificationsResponse>, unknown> & {
  refresh: () => Promise<void>;
} => {
  const [isRefetching, setIsRefetching] = useState(false);
  const queryClient = useQueryClient();

  const addCastsFromNotifications = useCastStore(
    (state) => state.addCastsFromNotifications,
  );
  const addUsersFromNotifications = useUserStore(
    (state) => state.addUsersFromNotifications,
  );
  const addChannelsFromNotifications = useChannelStore(
    (state) => state.addChannelsFromNotifications,
  );

  const queryKey = ["notifications-priority", fid];

  const props = useInfiniteQuery<
    FetchNotificationsResponse,
    unknown,
    InfiniteData<FetchNotificationsResponse>,
    string[],
    string | undefined
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      console.log("yo", pageParam);
      const data = await fetchNotifications({ fid, priority: true }, pageParam);
      addCastsFromNotifications(data.data);
      addUsersFromNotifications(data.data);
      addChannelsFromNotifications(data.data);
      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
    refetchOnWindowFocus: false,
  });

  const refresh = async () => {
    setIsRefetching(true);
    queryClient.setQueryData<InfiniteData<FetchNotificationsResponse>>(
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

export const useMentionsNotifications = (
  fid: string,
  initialData?: FetchNotificationsResponse,
): UseInfiniteQueryResult<InfiniteData<FetchNotificationsResponse>, unknown> & {
  refresh: () => Promise<void>;
} => {
  const [isRefetching, setIsRefetching] = useState(false);
  const queryClient = useQueryClient();

  const addCastsFromNotifications = useCastStore(
    (state) => state.addCastsFromNotifications,
  );
  const addUsersFromNotifications = useUserStore(
    (state) => state.addUsersFromNotifications,
  );
  const addChannelsFromNotifications = useChannelStore(
    (state) => state.addChannelsFromNotifications,
  );

  const queryKey = ["notifications-mentions", fid];

  const props = useInfiniteQuery<
    FetchNotificationsResponse,
    unknown,
    InfiniteData<FetchNotificationsResponse>,
    string[],
    string | undefined
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const data = await fetchNotifications(
        { fid, types: ["MENTION", "QUOTE", "REPLY"] },
        pageParam,
      );
      addCastsFromNotifications(data.data);
      addUsersFromNotifications(data.data);
      addChannelsFromNotifications(data.data);
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
    queryClient.setQueryData<InfiniteData<FetchNotificationsResponse>>(
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

export const useAllNotifications = (
  fid: string,
  types?: NotificationType[],
  initialData?: FetchNotificationsResponse,
): UseInfiniteQueryResult<InfiniteData<FetchNotificationsResponse>, unknown> & {
  refresh: () => Promise<void>;
} => {
  const [isRefetching, setIsRefetching] = useState(false);
  const queryClient = useQueryClient();

  const addCastsFromNotifications = useCastStore(
    (state) => state.addCastsFromNotifications,
  );
  const addUsersFromNotifications = useUserStore(
    (state) => state.addUsersFromNotifications,
  );
  const addChannelsFromNotifications = useChannelStore(
    (state) => state.addChannelsFromNotifications,
  );

  const queryKey = ["notifications-all", fid, JSON.stringify(types)];

  const props = useInfiniteQuery<
    FetchNotificationsResponse,
    unknown,
    InfiniteData<FetchNotificationsResponse>,
    string[],
    string | undefined
  >({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const data = await fetchNotifications(
        { fid, types: types && types.length > 0 ? types : undefined },
        pageParam,
      );
      addCastsFromNotifications(data.data);
      addUsersFromNotifications(data.data);
      addChannelsFromNotifications(data.data);
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
    queryClient.setQueryData<InfiniteData<FetchNotificationsResponse>>(
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
