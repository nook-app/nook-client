"use client";

import { useTransactionFeed } from "../../api/transactions";
import {
  FetchTransactionsResponse,
  TransactionFeedFilter,
} from "@nook/common/types";
import { useState } from "react";
import { TransactionInfiniteFeed } from "./infinite-feed";
import { Loading } from "../../components/loading";
import { View } from "@nook/app-ui";
import { TransactionGroupSelector } from "./transaction-group-selector";

export const TransactionFeed = ({
  filter,
  initialData,
  asTabs,
  paddingTop,
  paddingBottom,
  ListHeaderComponent,
}: {
  filter: TransactionFeedFilter;
  initialData?: FetchTransactionsResponse;
  asTabs?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  ListHeaderComponent?: JSX.Element;
}) => {
  const {
    data,
    isLoading,
    refresh,
    isRefetching,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
  } = useTransactionFeed(filter, initialData);

  const transactions = data?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading) {
    return <Loading />;
  }

  return (
    <TransactionInfiniteFeed
      transactions={transactions}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      refetch={refresh}
      isRefetching={isRefetching}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      asTabs={asTabs}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
};

export const TransactionFeedWithGroupSelector = ({
  filter,
  initialData,
  asTabs,
  paddingTop,
  paddingBottom,
}: {
  filter: TransactionFeedFilter;
  initialData?: FetchTransactionsResponse;
  asTabs?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
}) => {
  const [contextActions, setContextActions] = useState<string[] | undefined>();

  return (
    <TransactionFeed
      filter={{
        ...filter,
        contextActions,
      }}
      initialData={!contextActions ? initialData : undefined}
      asTabs={asTabs}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      ListHeaderComponent={
        <View borderBottomWidth="$0.5" borderColor="$borderColorBg">
          <TransactionGroupSelector onPress={setContextActions} />
        </View>
      }
    />
  );
};
