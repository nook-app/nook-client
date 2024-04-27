"use client";

import { View, XStack } from "@nook/ui";
import {
  useAllNotifications,
  useMentionsNotifications,
  usePriorityNotifications,
} from "../../api/notifications";
import { NotificationsInfiniteFeed } from "./notifications-feed";
import { NotificationType } from "../../types";
import { useCallback, useEffect, useState } from "react";
import {
  AtSign,
  Heart,
  MessageSquare,
  MessageSquareQuote,
  Repeat2,
  User,
} from "@tamagui/lucide-icons";
import { markNotificationsRead } from "../../server/notifications";
import { useQueryClient } from "@tanstack/react-query";

export const NotificationsPriorityFeed = ({ fid }: { fid: string }) => {
  const queryClient = useQueryClient();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    usePriorityNotifications(fid);

  const notifications = data?.pages.flatMap((page) => page.data) ?? [];

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    markNotificationsRead();
  }, [queryClient]);

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

export const NotificationsMentionsFeed = ({ fid }: { fid: string }) => {
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

export const NotificationsAllFeed = ({ fid }: { fid: string }) => {
  const [types, setTypes] = useState<NotificationType[]>([]);
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useAllNotifications(fid, types);

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

  return (
    <View>
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
        isLoading={isLoading}
      />
    </View>
  );
};
