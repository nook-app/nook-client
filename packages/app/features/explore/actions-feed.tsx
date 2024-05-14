"use client";

import { Separator, Spinner, View } from "@nook/app-ui";
import { CastAction } from "@nook/common/types";
import { InfiniteScrollList } from "../../components/infinite-scroll-list";
import { FarcasterActionItem } from "./actions-item";

export const FarcasterActionsFeed = ({
  actions,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
  refetch,
  isRefetching,
  paddingTop,
  paddingBottom,
  asTabs,
}: {
  actions: CastAction[];
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  refetch?: () => Promise<void>;
  isRefetching?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  asTabs?: boolean;
}) => {
  return (
    <InfiniteScrollList
      data={actions}
      renderItem={({ item }) => (
        <FarcasterActionItem action={item as CastAction} />
      )}
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
    />
  );
};
