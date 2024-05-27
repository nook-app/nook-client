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
