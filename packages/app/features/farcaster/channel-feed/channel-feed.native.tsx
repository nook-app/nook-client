"use client";

import { Channel } from "@nook/common/types";
import { Spinner, View } from "@nook/app-ui";
import { useScroll } from "../../../context/scroll";
import { useCallback, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Tabs } from "react-native-collapsible-tab-view";
import { RefreshControl } from "../../../components/refresh-control";
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
  const { setIsScrolling } = useScroll();
  const [lastScrollY, setLastScrollY] = useState(0);

  const ref = useRef(null);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const currentScrollY = event.nativeEvent.contentOffset.y;
      const delta = currentScrollY - lastScrollY;

      if (delta > 0 && currentScrollY > 50) {
        setIsScrolling(true);
      } else if (delta < -50) {
        setIsScrolling(false);
      }

      setLastScrollY(currentScrollY);
    },
    [lastScrollY, setIsScrolling],
  );

  const List = asTabs ? Tabs.FlashList : FlashList;

  return (
    <List
      ref={ref}
      data={channels}
      renderItem={({ item }) => (
        <FarcasterChannelFeedItem channel={item as Channel} withBio />
      )}
      ListFooterComponent={() =>
        isFetchingNextPage ? (
          <View marginVertical="$3">
            <Spinner />
          </View>
        ) : null
      }
      onEndReached={fetchNextPage}
      onEndReachedThreshold={5}
      estimatedItemSize={300}
      onScroll={handleScroll}
      scrollEventThrottle={128}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          paddingTop={paddingTop}
        />
      }
      contentContainerStyle={{
        paddingTop,
        paddingBottom,
      }}
    />
  );
};
