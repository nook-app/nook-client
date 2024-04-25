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
  displayMode = Display.CASTS,
}: {
  channels: Channel[];
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  displayMode?: Display;
}) => {
  return (
    <InfiniteScrollList
      data={channels}
      renderItem={({ item }) => (
        <FarcasterChannelFeedItem channel={item as Channel} />
      )}
      onEndReached={fetchNextPage}
      numColumns={displayMode === Display.GRID ? 3 : 1}
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
