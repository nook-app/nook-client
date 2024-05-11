"use client";

import { Separator, Spinner, View } from "@nook/app-ui";
import { NotificationResponse } from "@nook/common/types";
import { InfiniteScrollList } from "../../components/infinite-scroll-list";
import { NotificationItem } from "./notifications-item";

export const NotificationsInfiniteFeed = ({
  notifications,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
  ListHeaderComponent,
  refetch,
  isRefetching,
  paddingTop,
  paddingBottom,
  asTabs,
}: {
  notifications: NotificationResponse[];
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  ListHeaderComponent?: JSX.Element;
  refetch: () => Promise<void>;
  isRefetching: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  asTabs?: boolean;
}) => {
  return (
    <InfiniteScrollList
      data={notifications}
      renderItem={({ item }) => (
        <NotificationItem notification={item as NotificationResponse} />
      )}
      onEndReached={fetchNextPage}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View marginVertical="$3">
            <Spinner />
          </View>
        ) : null
      }
      ListHeaderComponent={ListHeaderComponent}
      ItemSeparatorComponent={() => (
        <Separator width="100%" borderBottomColor="$borderColorBg" />
      )}
    />
  );
};
