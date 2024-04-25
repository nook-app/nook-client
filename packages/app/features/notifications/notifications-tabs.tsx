"use client";

import { View } from "@nook/ui";
import { Tabs } from "../../components/tabs/tabs";
import { useAuth } from "../../context/auth";
import {
  useAllNotifications,
  useMentionsNotifications,
  usePriorityNotifications,
} from "../../api/notifications";
import { NotificationsInfiniteFeed } from "./notifications-feed";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Session } from "../../types";
import { markNotificationsRead } from "../../server/notifications";

export const NotificationsTabs = ({
  session,
  activeTab,
}: { session: Session; activeTab: string }) => {
  const queryClient = useQueryClient();
  const tabs = [
    {
      id: "priority",
      label: "Priority",
      href: "/notifications",
    },
    {
      id: "mentions",
      label: "Mentions",
      href: "/notifications/mentions",
    },
    {
      id: "all",
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
      <Tabs tabs={tabs} activeTab={activeTab} />
      <NotificationsFeed activeTab={activeTab} />
    </View>
  );
};

const NotificationsFeed = ({ activeTab }: { activeTab: string }) => {
  const { session } = useAuth();

  if (!session?.fid) return null;

  switch (activeTab) {
    case "priority":
      return <NotificationsPriorityFeed fid={session.fid} />;
    case "mentions":
      return <NotificationsMentionsFeed fid={session.fid} />;
    case "all":
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
