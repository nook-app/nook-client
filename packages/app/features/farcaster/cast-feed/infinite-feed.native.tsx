"use client";

import { Display, FarcasterCastResponse } from "@nook/common/types";
import { AnimatePresence, Spinner, View } from "@nook/app-ui";
import { FarcasterCastResponseDisplay } from "../../../components/farcaster/casts/cast-display";
import { FlashList } from "@shopify/flash-list";

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
  return (
    <FlashList
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
            <Spinner />
          </View>
        ) : null
      }
      ListHeaderComponent={ListHeaderComponent}
      estimatedItemSize={300}
    />
  );
};
