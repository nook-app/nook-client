"use client";

import { View, XStack } from "@nook/app-ui";
import {
  useAllNotifications,
  useMentionsNotifications,
  usePriorityNotifications,
} from "../../hooks/api/notifications";
import { NotificationsInfiniteFeed } from "./notifications-feed";
import {
  FetchNotificationsResponse,
  NotificationType,
} from "@nook/common/types";
import { useCallback, useEffect, useState } from "react";
import {
  AtSign,
  Heart,
  MessageSquare,
  MessageSquareQuote,
  Repeat2,
  User,
} from "@tamagui/lucide-icons";
import { markNotificationsRead } from "../../api/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { Loading } from "../../components/loading";

export const NotificationsPriorityFeed = ({
  fid,
  initialData,
  paddingTop,
  paddingBottom,
  asTabs,
}: {
  fid: string;
  initialData?: FetchNotificationsResponse;
  paddingTop?: number;
  paddingBottom?: number;
  asTabs?: boolean;
}) => {
  const queryClient = useQueryClient();
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refresh,
    isRefetching,
  } = usePriorityNotifications(fid, initialData);

  const notifications = data?.pages.flatMap((page) => page.data) ?? [];

  useEffect(
    useCallback(() => {
      markNotificationsRead().then(() =>
        queryClient.invalidateQueries({ queryKey: ["notifications-count"] }),
      );
    }, [queryClient]),
  );

  if (isLoading) {
    return <Loading />;
  }

  return (
    <NotificationsInfiniteFeed
      notifications={notifications}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      refetch={refresh}
      isRefetching={isRefetching}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      asTabs={asTabs}
    />
  );
};

export const NotificationsMentionsFeed = ({
  fid,
  initialData,
  paddingTop,
  paddingBottom,
  asTabs,
}: {
  fid: string;
  initialData?: FetchNotificationsResponse;
  paddingTop?: number;
  paddingBottom?: number;
  asTabs?: boolean;
}) => {
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refresh,
    isRefetching,
  } = useMentionsNotifications(fid, initialData);

  const notifications = data?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading) {
    return <Loading />;
  }

  return (
    <NotificationsInfiniteFeed
      notifications={notifications}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      refetch={refresh}
      isRefetching={isRefetching}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      asTabs={asTabs}
    />
  );
};

export const NotificationsAllFeed = ({
  fid,
  initialData,
  paddingTop,
  paddingBottom,
  asTabs,
}: {
  fid: string;
  initialData?: FetchNotificationsResponse;
  paddingTop?: number;
  paddingBottom?: number;
  asTabs?: boolean;
}) => {
  const [types, setTypes] = useState<NotificationType[]>([]);
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refresh,
    isRefetching,
  } = useAllNotifications(
    fid,
    types,
    types.length === 0 ? initialData : undefined,
  );

  const notifications = data?.pages.flatMap((page) => page.data) ?? [];

  const toggleType = useCallback((type: NotificationType) => {
    setTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }, []);

  const options = [
    {
      label: "Likes",
      value: NotificationType.LIKE,
      Icon: Heart,
    },
    {
      label: "Recasts",
      value: NotificationType.RECAST,
      Icon: Repeat2,
    },
    {
      label: "Follows",
      value: NotificationType.FOLLOW,
      Icon: User,
    },
    {
      label: "Replies",
      value: NotificationType.REPLY,
      Icon: MessageSquare,
    },
    {
      label: "Quotes",
      value: NotificationType.QUOTE,
      Icon: MessageSquareQuote,
    },
    {
      label: "Mentions",
      value: NotificationType.MENTION,
      Icon: AtSign,
    },
  ];

  if (isLoading) {
    return <Loading />;
  }

  return (
    <View flexGrow={1}>
      <XStack
        justifyContent="space-around"
        padding="$2"
        borderBottomWidth="$0.5"
        borderColor="$borderColorBg"
      >
        {options.map(({ value, Icon }) => (
          <View
            cursor="pointer"
            width="$2.5"
            height="$2.5"
            justifyContent="center"
            alignItems="center"
            borderRadius="$10"
            group
            hoverStyle={{
              // @ts-ignore
              transition: "all 0.2s ease-in-out",
              backgroundColor: "$color3",
            }}
            backgroundColor={types.includes(value) ? "$color3" : undefined}
            onPress={() => toggleType(value)}
          >
            <Icon
              size={20}
              opacity={types.includes(value) ? 1 : 0.5}
              $group-hover={{
                color: "$color9",
                opacity: 1,
              }}
              color={types.includes(value) ? "$color9" : undefined}
            />
          </View>
        ))}
      </XStack>
      <NotificationsInfiniteFeed
        notifications={notifications}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        refetch={refresh}
        isRefetching={isRefetching}
        paddingTop={paddingTop}
        paddingBottom={paddingBottom}
        asTabs={asTabs}
      />
    </View>
  );
};
