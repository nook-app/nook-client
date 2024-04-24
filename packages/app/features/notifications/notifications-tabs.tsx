"use client";

import { View } from "@nook/ui";
import { Tabs } from "../../components/tabs/tabs";
import { useAuth } from "../../context/auth";
import {
  markNotificationsRead,
  useAllNotifications,
  useMentionsNotifications,
  usePriorityNotifications,
} from "../../api/notifications";
import { NotificationsInfiniteFeed } from "./notifications-feed";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export const NotificationsTabs = ({ activeIndex }: { activeIndex: number }) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const tabs = [
    {
      label: "Priority",
      href: "/notifications",
    },
    {
      label: "Mentions",
      href: "/notifications/mentions",
    },
    {
      label: "All",
      href: "/notifications/all",
    },
  ];

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    markNotificationsRead().then(() =>
      queryClient.invalidateQueries({
        queryKey: ["notifications-count", session?.fid],
      }),
    );
  }, []);

  return (
    <View>
      <Tabs tabs={tabs} activeIndex={activeIndex} />
      <NotificationsFeed activeIndex={activeIndex} />
    </View>
  );
};

const NotificationsFeed = ({ activeIndex }: { activeIndex: number }) => {
  const { session } = useAuth();

  if (!session?.fid) return null;

  switch (activeIndex) {
    case 0:
      return <NotificationsPriorityFeed fid={session.fid} />;
    case 1:
      return <NotificationsMentionsFeed fid={session.fid} />;
    case 2:
      return <NotificationsAllFeed fid={session.fid} />;
  }
};

const NotificationsPriorityFeed = ({ fid }: { fid: string }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    usePriorityNotifications(fid);

  const notifications = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <NotificationsInfiniteFeed
      notifications={notifications}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      isLoading={isLoading}
    />
  );
};

const NotificationsMentionsFeed = ({ fid }: { fid: string }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useMentionsNotifications(fid);

  const notifications = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <NotificationsInfiniteFeed
      notifications={notifications}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      isLoading={isLoading}
    />
  );
};

const NotificationsAllFeed = ({ fid }: { fid: string }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useAllNotifications(fid);

  const notifications = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <NotificationsInfiniteFeed
      notifications={notifications}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      isLoading={isLoading}
    />
  );
};
