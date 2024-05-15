"use client";

import { Transaction } from "@nook/common/types";
import { Separator, Spinner, View } from "@nook/app-ui";
import { InfiniteScrollList } from "../../components/infinite-scroll-list";
import { TransactionLink } from "./transaction-link";

export const TransactionInfiniteFeed = ({
  transactions,
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
  transactions: Transaction[];
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
      data={transactions}
      renderItem={({ item }) => (
        <TransactionLink transaction={item as Transaction} />
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
      ListHeaderComponent={ListHeaderComponent}
    />
  );
};
