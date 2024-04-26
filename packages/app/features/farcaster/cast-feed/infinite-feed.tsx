"use client";

import { Display, FarcasterCast } from "../../../types";
import { Spinner, View } from "@nook/ui";
import { InfiniteScrollList } from "../../../components/infinite-scroll-list";
import { FarcasterCastDisplay } from "../../../components/farcaster/casts/cast-display";
import { Loading } from "../../../components/loading";

export const FarcasterInfiniteFeed = ({
  queryKey,
  casts,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
  displayMode = Display.CASTS,
  ListHeaderComponent,
  isLoading,
}: {
  queryKey: string[];
  casts: FarcasterCast[];
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  displayMode?: Display;
  ListHeaderComponent?: JSX.Element;
  isLoading?: boolean;
}) => {
  return (
    <InfiniteScrollList
      data={casts}
      renderItem={({ item }) => (
        <FarcasterCastDisplay
          cast={item as FarcasterCast}
          displayMode={displayMode}
          queryKey={queryKey}
        />
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
      ListEmptyComponent={isLoading ? <Loading /> : <View />}
    />
  );
};
