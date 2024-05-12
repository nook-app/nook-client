"use client";

import { Channel } from "@nook/common/types";
import { Spinner, View } from "@nook/app-ui";
import { InfiniteScrollList } from "../../../components/infinite-scroll-list";
import { FarcasterChannelFeedItem } from "./channel-feed-item";

export const FarcasterChannelInfiniteFeed = ({
  channels,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
  refetch,
  isRefetching,
  paddingTop,
  paddingBottom,
  asTabs,
}: {
  channels: Channel[];
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  refetch: () => Promise<void>;
  isRefetching: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  asTabs?: boolean;
}) => {
  return (
    <InfiniteScrollList
      data={channels}
      renderItem={({ item }) => (
        <FarcasterChannelFeedItem channel={item as Channel} withBio />
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
