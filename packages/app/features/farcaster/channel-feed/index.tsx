"use client";

import { Channel, Display } from "../../../types";
import { Spinner, View } from "@nook/ui";
import { InfiniteScrollList } from "../../../components/infinite-scroll-list";
import { FarcasterChannelFeedItem } from "./channel-feed-item";

export const FarcasterChannelInfiniteFeed = ({
  channels,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
}: {
  channels: Channel[];
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
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
            <Spinner size="small" color="$color9" />
          </View>
        ) : null
      }
    />
  );
};
