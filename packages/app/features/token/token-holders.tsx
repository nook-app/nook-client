"use client";

import {
  FetchTokenHoldersResponse,
  Token,
  TokenHolder,
} from "@nook/common/types";
import { InfiniteFeed } from "../../components/infinite-feed";
import { Loading } from "../../components/loading";
import { TokenHolderItem } from "./token-holder-item";
import {
  useFarcasterTokenHolders,
  useFollowingTokenHolders,
  useTokenHolders,
} from "../../api/token";
import { Button, Text, XStack, YStack } from "@nook/app-ui";
import { Link } from "../../components/link";
import { memo } from "react";

export const TokenHolders = ({
  token,
  initialData,
  asTabs,
  paddingTop,
  paddingBottom,
}: {
  token: Token;
  initialData?: FetchTokenHoldersResponse;
  asTabs?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
}) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useTokenHolders({ tokenId: token.id }, initialData);

  if (isLoading) {
    return <Loading asTabs />;
  }

  const holders = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <InfiniteFeed
      data={holders}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      asTabs={asTabs}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      renderItem={({ item }) => (
        <TokenHolderItem token={token} holder={item as TokenHolder} />
      )}
    />
  );
};

export const FarcasterTokenHolders = ({
  token,
  initialData,
  asTabs,
  paddingTop,
  paddingBottom,
  ListHeaderComponent,
}: {
  token: Token;
  initialData?: FetchTokenHoldersResponse;
  asTabs?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  ListHeaderComponent?: JSX.Element;
}) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useFarcasterTokenHolders({ tokenId: token.id }, initialData);

  if (isLoading) {
    return <Loading asTabs />;
  }

  const holders = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <InfiniteFeed
      data={holders}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      asTabs={asTabs}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      renderItem={({ item }) => (
        <TokenHolderItem token={token} holder={item as TokenHolder} />
      )}
      ListHeaderComponent={ListHeaderComponent}
    />
  );
};

export const FollowingTokenHolders = ({
  token,
  initialData,
  asTabs,
  paddingTop,
  paddingBottom,
}: {
  token: Token;
  initialData?: FetchTokenHoldersResponse;
  asTabs?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
}) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useFollowingTokenHolders({ tokenId: token.id }, initialData);

  if (isLoading) {
    return <Loading asTabs />;
  }

  const holders = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <InfiniteFeed
      data={holders}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      asTabs={asTabs}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      renderItem={({ item }) => (
        <TokenHolderItem token={token} holder={item as TokenHolder} />
      )}
    />
  );
};

export const FarcasterTokenHoldersHeader = memo(
  ({ token }: { token: Token }) => (
    <XStack
      paddingHorizontal="$2.5"
      gap="$2.5"
      paddingTop="$2.5"
      paddingBottom="$1.5"
      alignItems="center"
      justifyContent="space-between"
    >
      <Text color="$mauve111">Holders on Farcaster</Text>
      <XStack gap="$2">
        <Link href={`/tokens/${token.id}/holders-following`} unpressable>
          <Button
            borderWidth="$0"
            backgroundColor="$color4"
            borderRadius="$10"
            height="$2.5"
            minHeight="$2.5"
            padding="$0"
            paddingHorizontal="$3"
            fontWeight="500"
          >
            View following
          </Button>
        </Link>
        <Link href={`/tokens/${token.id}/holders`} unpressable>
          <Button
            borderWidth="$0"
            backgroundColor="$color4"
            borderRadius="$10"
            height="$2.5"
            minHeight="$2.5"
            padding="$0"
            paddingHorizontal="$3"
            fontWeight="500"
          >
            View all
          </Button>
        </Link>
      </XStack>
    </XStack>
  ),
);
