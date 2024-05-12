"use client";

import { useTransactionFeed } from "../../api/transactions";
import {
  FetchTransactionsResponse,
  TransactionFeedFilter,
} from "@nook/common/types";
import { useCallback, useState } from "react";
import { TransactionInfiniteFeed } from "./infinite-feed";
import { Loading } from "../../components/loading";
import { View } from "@nook/app-ui";
import { TransactionChainSelector } from "./transaction-chain-selector";

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
  const [isRefetching, setIsRefetching] = useState(false);
  const { data, isLoading, refetch } = useTransactionFeed(filter, initialData);

  const transactions = data?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading) {
    return <Loading />;
  }

  const handleRefresh = async () => {
    setIsRefetching(true);
    await refetch();
    setIsRefetching(false);
  };

  return (
    <TransactionInfiniteFeed
      transactions={transactions}
      asTabs={asTabs}
      refetch={handleRefresh}
      isRefetching={isRefetching}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
};

export const TransactionFeedWithChainSelector = ({
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
  const [chains, setChains] = useState<number[]>([]);

  const toggleChain = useCallback((chain: number) => {
    setChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain],
    );
  }, []);

  return (
    <TransactionFeed
      filter={{
        ...filter,
        chains,
      }}
      initialData={chains.length === 0 ? initialData : undefined}
      asTabs={asTabs}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      ListHeaderComponent={
        <View borderBottomWidth="$0.5" borderColor="$borderColorBg">
          <TransactionChainSelector chains={chains} onPress={toggleChain} />
        </View>
      }
    />
  );
};
