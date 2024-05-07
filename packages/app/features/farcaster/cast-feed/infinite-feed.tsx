"use client";

import { Display, FarcasterCast } from "@nook/common/types";
import { AnimatePresence, Spinner, View } from "@nook/ui";
import { InfiniteScrollList } from "../../../components/infinite-scroll-list";
import { FarcasterCastDisplay } from "../../../components/farcaster/casts/cast-display";
import { useRouter } from "next/navigation";

export const FarcasterInfiniteFeed = ({
  casts,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
  displayMode = Display.CASTS,
  ListHeaderComponent,
}: {
  casts: FarcasterCast[];
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
            <FarcasterCastDisplay
              cast={item as FarcasterCast}
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
        const casts = viewableItems.map((item) => item.item as FarcasterCast);
        for (const cast of casts) {
          router.prefetch(`/casts/${cast.hash}`);
        }
      }}
    />
  );
};
