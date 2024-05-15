"use client";

import { Separator, Spinner, Text, View } from "@nook/app-ui";
import { InfiniteScrollList } from "../../components/infinite-scroll-list";
import { List } from "@nook/common/types";
import { ListFeedItem } from "./list-feed-item";
import { ListEmptyState } from "./list-empty-state";

export const ListInfiniteFeed = ({
  lists,
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
  lists: List[];
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  ListHeaderComponent?: JSX.Element;
  refetch: () => Promise<void>;
  isRefetching: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  asTabs?: boolean;
}) => {
  return (
    <InfiniteScrollList
      data={lists}
      renderItem={({ item }) => <ListFeedItem list={item as List} />}
      onEndReached={fetchNextPage}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View marginVertical="$3">
            <Spinner />
          </View>
        ) : null
      }
      ItemSeparatorComponent={() => (
        <Separator width="100%" borderBottomColor="$borderColorBg" />
      )}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={<ListEmptyState />}
    />
  );
};
