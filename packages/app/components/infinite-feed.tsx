"use client";

import { Spinner, View } from "@nook/app-ui";
import { InfiniteScrollList } from "./infinite-scroll-list";

export const InfiniteFeed = ({
  data,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
  ListHeaderComponent,
  refetch,
  isRefetching,
  paddingTop,
  paddingBottom,
  asTabs,
  renderItem,
  numColumns,
  ItemSeparatorComponent,
  alwaysBounceVertical,
}: {
  data: unknown[];
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  ListHeaderComponent?: JSX.Element;
  refetch?: () => Promise<void>;
  isRefetching?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  asTabs?: boolean;
  renderItem: ({ item }: { item: unknown }) => JSX.Element;
  numColumns?: number;
  ItemSeparatorComponent?: () => JSX.Element;
  alwaysBounceVertical?: boolean;
}) => {
  return (
    <InfiniteScrollList
      data={data}
      renderItem={renderItem}
      onEndReached={fetchNextPage}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View marginVertical="$3">
            <Spinner />
          </View>
        ) : null
      }
      ListHeaderComponent={ListHeaderComponent}
      numColumns={numColumns}
      ItemSeparatorComponent={ItemSeparatorComponent}
      alwaysBounceVertical={alwaysBounceVertical}
    />
  );
};
