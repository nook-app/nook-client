"use client";

import { Transaction } from "@nook/common/types";
import { AnimatePresence, Spinner, View } from "@nook/app-ui";
import { TransactionFeedItem } from "./transaction-feed-item";
import { InfiniteScrollList } from "../../components/infinite-scroll-list";

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
        <AnimatePresence>
          <View
            enterStyle={{
              opacity: 0,
            }}
            exitStyle={{
              opacity: 0,
            }}
            animation="quick"
            opacity={1}
            scale={1}
            y={0}
          >
            <TransactionFeedItem transaction={item as Transaction} />
          </View>
        </AnimatePresence>
      )}
      onEndReached={fetchNextPage}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View marginVertical="$3">
            <Spinner />
          </View>
        ) : null
      }
    />
  );
};
