"use client";

import { FarcasterUserV1 } from "@nook/common/types";
import { AnimatePresence, Spinner, View } from "@nook/app-ui";
import { InfiniteScrollList } from "../../../components/infinite-scroll-list";
import { FarcasterUserItem } from "./user-item";

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
  return (
    <InfiniteScrollList
      data={users}
      renderItem={({ item }) => (
        <AnimatePresence>
          <View
            enterStyle={{
              opacity: 0,
            }}
            exitStyle={{
              opacity: 0,
            }}
            animation="100ms"
            opacity={1}
            scale={1}
            y={0}
          >
            <FarcasterUserItem user={item as FarcasterUserV1} />
          </View>
        </AnimatePresence>
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
