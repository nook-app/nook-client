"use client";

import { Channel } from "@nook/common/types";
import { AnimatePresence, Spinner, View } from "@nook/app-ui";
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
            <FarcasterChannelFeedItem channel={item as Channel} withBio />
          </View>
        </AnimatePresence>
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
