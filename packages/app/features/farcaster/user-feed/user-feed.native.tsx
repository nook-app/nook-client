"use client";

import { FarcasterUserV1 } from "@nook/common/types";
import { Spinner, View } from "@nook/app-ui";
import { FarcasterUserItem } from "./user-item";
import { useScroll } from "../../../context/scroll";
import { useCallback, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { FlashList } from "@shopify/flash-list";
import { Tabs } from "react-native-collapsible-tab-view";
import { RefreshControl } from "../../../components/refresh-control";

export const FarcasterUserInfiniteFeed = ({
  users,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
  refetch,
  isRefetching,
  paddingTop,
  paddingBottom,
  asTabs,
}: {
  users: FarcasterUserV1[];
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  refetch?: () => Promise<void>;
  isRefetching?: boolean;
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
      data={users}
      renderItem={({ item }) => <FarcasterUserItem user={item} />}
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
        refetch && isRefetching ? (
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            paddingTop={paddingTop}
          />
        ) : undefined
      }
      contentContainerStyle={{
        paddingTop,
        paddingBottom,
      }}
    />
  );
};
