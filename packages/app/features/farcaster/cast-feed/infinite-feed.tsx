"use client";

import { Display, FarcasterCastV1 } from "@nook/common/types";
import { Separator, Spinner, View } from "@nook/app-ui";
import { InfiniteScrollList } from "../../../components/infinite-scroll-list";
import { useRouter } from "next/navigation";
import { FarcasterCastLink } from "../../../components/farcaster/casts/cast-link";

export const FarcasterInfiniteFeed = ({
  casts,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
  displayMode = Display.CASTS,
  ListHeaderComponent,
  refetch,
  isRefetching,
  paddingTop,
  paddingBottom,
  asTabs,
}: {
  casts: FarcasterCastV1[];
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  displayMode?: Display;
  ListHeaderComponent?: JSX.Element;
  refetch: () => Promise<void>;
  isRefetching: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  asTabs?: boolean;
}) => {
  const router = useRouter();

  return (
    <InfiniteScrollList
      data={casts}
      renderItem={({ item }) => (
        <FarcasterCastLink
          cast={item as FarcasterCastV1}
          displayMode={displayMode}
        />
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
      ItemSeparatorComponent={() => (
        <Separator width="100%" borderBottomColor="$borderColorBg" />
      )}
      ListHeaderComponent={ListHeaderComponent}
      onViewableItemsChanged={({ viewableItems }) => {
        const casts = viewableItems.map((item) => item.item as FarcasterCastV1);
        for (const cast of casts) {
          router.prefetch(`/casts/${cast.hash}`);
        }
      }}
    />
  );
};
