"use client";

import { NookText, View, XStack } from "@nook/app-ui";
import { useTransactionFeed } from "../../api/transactions";
import { Loading } from "../../components/loading";
import {
  FetchTransactionsResponse,
  TransactionFeedFilter,
} from "@nook/common/types";
import { CdnAvatar } from "../../components/cdn-avatar";
import { CHAINS } from "../../utils/chains";
import { useCallback, useState } from "react";
import { TransactionInfiniteFeed } from "./infinite-feed";

export const TransactionFeed = ({
  filter,
  initialData,
  asTabs,
}: {
  filter: TransactionFeedFilter;
  initialData?: FetchTransactionsResponse;
  asTabs?: boolean;
}) => {
  const [isRefetching, setIsRefetching] = useState(false);
  const [chains, setChains] = useState<number[]>([]);
  const { data, isLoading, refetch } = useTransactionFeed(
    { ...filter, chains: chains.length > 0 ? chains : undefined },
    chains.length > 0 ? undefined : initialData,
  );

  const toggleChain = useCallback((chain: number) => {
    setChains((prev) =>
      prev.includes(chain) ? prev.filter((c) => c !== chain) : [...prev, chain],
    );
  }, []);

  const options = [8453, 7777777, 10, 1].map((c) => CHAINS[c]).filter(Boolean);

  if (isLoading) {
    return <Loading />;
  }

  const transactions = data?.pages.flatMap((page) => page.data) ?? [];

  const handleRefresh = async () => {
    setIsRefetching(true);
    await refetch();
    setIsRefetching(false);
  };

  return (
    <View>
      <XStack
        justifyContent="space-around"
        padding="$2"
        borderBottomWidth="$0.5"
        borderColor="$borderColorBg"
      >
        {options.map(({ chainId, name, image }) => (
          <XStack
            key={chainId}
            gap="$1.5"
            borderRadius="$6"
            paddingHorizontal="$2"
            paddingVertical="$1.5"
            borderColor={
              chains.includes(chainId) ? "$color10" : "$borderColorBg"
            }
            borderWidth="$0.5"
            cursor="pointer"
            hoverStyle={{
              // @ts-ignore
              transition: "all 0.2s ease-in-out",
              backgroundColor: "$color4",
            }}
            backgroundColor={chains.includes(chainId) ? "$color5" : undefined}
            onPress={() => toggleChain(chainId)}
          >
            <CdnAvatar src={image} size="$0.8" absolute />
            <NookText
              numberOfLines={1}
              ellipsizeMode="tail"
              fontWeight="500"
              fontSize="$3"
              opacity={chains.includes(chainId) ? 1 : 0.5}
              color={chains.includes(chainId) ? "$color12" : undefined}
            >
              {name}
            </NookText>
          </XStack>
        ))}
      </XStack>
      <TransactionInfiniteFeed
        transactions={transactions}
        asTabs={asTabs}
        refetch={handleRefresh}
        isRefetching={isRefetching}
      />
    </View>
  );
};
