"use client";

import { Display, FarcasterCastResponse } from "@nook/common/types";
import { AnimatePresence, Spinner, View } from "@nook/app-ui";
import { InfiniteScrollList } from "../../../components/infinite-scroll-list";
import { FarcasterCastResponseDisplay } from "../../../components/farcaster/casts/cast-display";
import { useRouter } from "next/navigation";

export const FarcasterInfiniteFeed = ({
  casts,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
  displayMode = Display.CASTS,
  ListHeaderComponent,
}: {
  casts: FarcasterCastResponse[];
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  displayMode?: Display;
  ListHeaderComponent?: JSX.Element;
}) => {
  const router = useRouter();

  return (
    <InfiniteScrollList
      data={casts}
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
            <FarcasterCastResponseDisplay
              cast={item as FarcasterCastResponse}
              displayMode={displayMode}
            />
          </View>
        </AnimatePresence>
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
      ListHeaderComponent={ListHeaderComponent}
      onViewableItemsChanged={({ viewableItems }) => {
        const casts = viewableItems.map(
          (item) => item.item as FarcasterCastResponse,
        );
        for (const cast of casts) {
          router.prefetch(`/casts/${cast.hash}`);
        }
      }}
    />
  );
};
