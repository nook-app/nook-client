"use client";

import {
  Token,
  TokenTransactionFilter,
  ZerionTransaction,
} from "@nook/common/types";
import { useTokenTransactions } from "../../api/token";
import { memo, useState } from "react";
import { Loading } from "../../components/loading";
import { InfiniteFeed } from "../../components/infinite-feed";
import { NookText, Text, View, XStack, YStack } from "@nook/app-ui";
import { CdnAvatar } from "../../components/cdn-avatar";
import { GradientIcon } from "../../components/gradient-icon";
import { formatNumber, formatPrice, formatTimeAgo } from "../../utils";
import { Link } from "../../components/link";
import { CHAINS_BY_NAME, ChainWithImage } from "../../utils/chains";
import { ChainIcon } from "../../components/blockchain/chain-icon";
import { useAuth } from "../../context/auth";

export const TokenTransactionsFeed = ({
  token,
  filter,
  asTabs,
  paddingTop,
  paddingBottom,
  ListHeaderComponent,
}: {
  token: Token;
  filter: TokenTransactionFilter;
  asTabs?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  ListHeaderComponent?: JSX.Element;
}) => {
  const {
    data,
    isLoading,
    refresh,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isRefetching,
  } = useTokenTransactions(filter);

  const transactions = data?.pages.flatMap((page) => page.data) ?? [];

  if (isLoading) {
    return <Loading />;
  }

  if (transactions.length === 0) {
    return (
      <YStack gap="$4" padding="$4" justifyContent="center" alignItems="center">
        <NookText muted textAlign="center">
          No activity found.
        </NookText>
      </YStack>
    );
  }

  return (
    <InfiniteFeed
      data={transactions}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      refetch={refresh}
      isRefetching={isRefetching}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      asTabs={asTabs}
      renderItem={({ item }) => (
        <TokenTransactionDisplay
          transaction={item as ZerionTransaction}
          address={data?.pages[0].address || ""}
        />
      )}
      alwaysBounceVertical={false}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
};

const TokenTransactionDisplay = ({
  transaction,
  address,
}: { transaction: ZerionTransaction; address: string }) => {
  const receivedNft = transaction.attributes.transfers.find(
    ({ nft_info, recipient }) => nft_info && recipient === address,
  );
  const sentToken = transaction.attributes.transfers.find(
    ({ fungible_info, sender }) => fungible_info && sender === address,
  );
  const receivedToken = transaction.attributes.transfers.find(
    ({ fungible_info, recipient }) =>
      fungible_info &&
      recipient === address &&
      fungible_info.symbol !== sentToken?.fungible_info?.symbol,
  );
  const approvalToken = transaction.attributes.approvals.find(
    ({ fungible_info }) => fungible_info,
  );

  const chain = CHAINS_BY_NAME[transaction.relationships.chain.data.id];

  if (approvalToken?.fungible_info) {
    return (
      <TokenTransactionItem
        chain={chain}
        image={approvalToken.fungible_info.icon?.url}
        label={approvalToken.fungible_info.name}
        type={toPastTense(transaction.attributes.operation_type)}
        timestamp={transaction.attributes.mined_at}
        amount={approvalToken.quantity.float}
        symbol={approvalToken.fungible_info.symbol}
      />
    );
  }

  if (receivedNft?.nft_info) {
    return (
      <TokenTransactionItem
        chain={chain}
        image={receivedNft.nft_info.content.preview.url}
        label={receivedNft.nft_info.name}
        type={toPastTense(transaction.attributes.operation_type)}
        timestamp={transaction.attributes.mined_at}
        amount={sentToken?.quantity.float || 0}
        symbol={sentToken?.fungible_info?.symbol || ""}
        delta={sentToken?.value || 0}
        isSender={true}
        imageLink={`/collectibles/${transaction.relationships.chain.data.id}.${receivedNft.nft_info.contract_address}.${receivedNft.nft_info.token_id}`}
      />
    );
  }

  if (receivedToken?.fungible_info && sentToken?.fungible_info) {
    return (
      <TokenTransactionItem
        chain={chain}
        image={receivedToken.fungible_info.icon?.url}
        label={`${sentToken.fungible_info.name} → ${receivedToken.fungible_info.name}`}
        type={"Swapped"}
        timestamp={transaction.attributes.mined_at}
        amount={sentToken.quantity.float}
        symbol={sentToken.fungible_info.symbol}
        delta={receivedToken.quantity.float || 0}
        deltaSymbol={receivedToken.fungible_info.symbol}
      />
    );
  }

  if (receivedToken?.fungible_info) {
    return (
      <TokenTransactionItem
        chain={chain}
        image={receivedToken.fungible_info.icon?.url}
        label={receivedToken.fungible_info.name}
        type={toPastTense(transaction.attributes.operation_type)}
        timestamp={transaction.attributes.mined_at}
        amount={receivedToken.quantity.float}
        symbol={receivedToken.fungible_info.symbol}
        delta={receivedToken.value || 0}
      />
    );
  }

  if (sentToken?.fungible_info) {
    return (
      <TokenTransactionItem
        chain={chain}
        image={sentToken.fungible_info.icon?.url}
        label={sentToken.fungible_info.name}
        type={toPastTense(transaction.attributes.operation_type)}
        timestamp={transaction.attributes.mined_at}
        amount={sentToken.quantity.float}
        symbol={sentToken.fungible_info.symbol}
        delta={sentToken.value || 0}
        isSender
      />
    );
  }
};

const TokenTransactionItem = ({
  chain,
  image,
  label,
  type,
  timestamp,
  amount,
  symbol,
  delta,
  isSender,
  deltaSymbol,
  imageLink,
}: {
  chain: ChainWithImage;
  image?: string;
  label: string;
  type: string;
  timestamp: Date;
  amount: number;
  delta?: number;
  symbol: string;
  isSender?: boolean;
  deltaSymbol?: string;
  imageLink?: string;
}) => {
  return (
    <XStack
      marginHorizontal="$2"
      marginVertical="$1.5"
      padding="$2.5"
      justifyContent="space-between"
      alignItems="center"
      borderRadius="$4"
      backgroundColor="$color2"
      gap="$2"
    >
      <XStack alignItems="center" gap="$3" flexShrink={1}>
        <View>
          {image ? (
            imageLink ? (
              <Link href={imageLink} touchable>
                <CdnAvatar src={image} size="$4" skipCdn borderRadius="$4" />
              </Link>
            ) : (
              <CdnAvatar src={image} size="$4" skipCdn borderRadius="$10" />
            )
          ) : (
            <GradientIcon label={label} size="$4" borderRadius="$10">
              <Text fontSize="$1" numberOfLines={1} fontWeight="500">
                {label}
              </Text>
            </GradientIcon>
          )}
          <View position="absolute" right={0} bottom={0}>
            <ChainIcon chainId={chain.crossChainId} />
          </View>
        </View>
        <YStack flexShrink={1} gap="$1">
          <Text fontWeight="600" fontSize="$5" numberOfLines={1}>
            {label}
          </Text>
          <Text color="$mauve11">
            {`${type} ${formatTimeAgo(new Date(timestamp).getTime(), true)}`}
          </Text>
        </YStack>
      </XStack>
      <YStack gap="$1" alignItems="flex-end">
        <Text fontSize="$4">
          {amount === 1.157920892373162e59
            ? "Unlimited"
            : `${formatNumber(amount, 2)} ${symbol}`}
        </Text>
        {delta !== undefined && delta !== 0 && (
          <Text color={isSender ? "$mauve11" : "$green11"}>{`${
            isSender ? "-" : "+"
          }${!deltaSymbol ? "$" : ""}${formatPrice(delta || 0)}${
            deltaSymbol ? ` ${deltaSymbol}` : ""
          }`}</Text>
        )}
      </YStack>
    </XStack>
  );
};

const toPastTense = (operation: string) => {
  switch (operation) {
    case "approve":
      return "Approved";
    case "borrow":
      return "Borrowed";
    case "burn":
      return "Burned";
    case "cancel":
      return "Cancelled";
    case "claim":
      return "Claimed";
    case "deploy":
      return "Deployed";
    case "execute":
      return "Executed";
    case "mint":
      return "Minted";
    case "receive":
      return "Received";
    case "repay":
      return "Repaid";
    case "send":
      return "Sent";
    case "stake":
      return "Staked";
    case "trade":
      return "Traded";
    case "unstake":
      return "Unstaked";
    case "withdraw":
      return "Withdrawn";
    default:
      return operation;
  }
};

export const TokenTransactionsFeedHeader = memo(() => (
  <XStack
    paddingHorizontal="$2.5"
    gap="$2.5"
    paddingTop="$2.5"
    paddingBottom="$1.5"
    alignItems="center"
    justifyContent="space-between"
  >
    <Text color="$mauve11">Your Activity</Text>
  </XStack>
));

export const TokenTransactionsFeedViewer = ({
  token,
  paddingBottom,
}: { token: Token; paddingBottom?: number }) => {
  const { session } = useAuth();
  if (!session?.fid) {
    return null;
  }

  return (
    <TokenTransactionsFeed
      token={token}
      filter={{
        fid: session?.fid,
        tokens: [token.id],
      }}
      asTabs
      paddingBottom={paddingBottom}
      ListHeaderComponent={<TokenTransactionsFeedHeader />}
    />
  );
};
