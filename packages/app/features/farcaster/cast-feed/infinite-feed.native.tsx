import { Display, FarcasterCastV1 } from "@nook/common/types";
import { Separator, Spinner, View } from "@nook/app-ui";
import { FlashList } from "@shopify/flash-list";
import { FarcasterCastLink } from "../../../components/farcaster/casts/cast-link";
import { RefreshControl } from "../../../components/refresh-control";
import { useCallback, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useScroll } from "../../../context/scroll";
import { useScrollToTop } from "@react-navigation/native";
import { useRef } from "react";
import { Tabs } from "react-native-collapsible-tab-view";

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
  const { setIsScrolling, setActiveVideo } = useScroll();
  const [lastScrollY, setLastScrollY] = useState(0);

  const ref = useRef(null);
  useScrollToTop(ref);

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

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: { item: FarcasterCastV1 }[] }) => {
      const videos = viewableItems.flatMap(({ item }) =>
        item.embeds.map(({ contentType, uri }) =>
          contentType?.startsWith("video") ||
          contentType?.startsWith("application/x-mpegURL")
            ? uri
            : null,
        ),
      );
      setActiveVideo(videos.find((video) => video) || "");
    },
    [setActiveVideo],
  );

  return (
    <List
      ref={ref}
      data={casts}
      renderItem={({ item, index }) => {
        return (
          <FarcasterCastLink
            cast={item as FarcasterCastV1}
            displayMode={displayMode}
          />
        );
      }}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={() =>
        isFetchingNextPage ? (
          <View marginVertical="$3">
            <Spinner />
          </View>
        ) : null
      }
      ItemSeparatorComponent={() => (
        <Separator width="100%" borderBottomColor="$borderColorBg" />
      )}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          paddingTop={paddingTop}
        />
      }
      onEndReached={fetchNextPage}
      onEndReachedThreshold={5}
      estimatedItemSize={300}
      numColumns={displayMode === Display.GRID ? 3 : 1}
      onScroll={handleScroll}
      scrollEventThrottle={128}
      contentContainerStyle={{
        paddingTop,
        paddingBottom,
      }}
      onViewableItemsChanged={handleViewableItemsChanged}
    />
  );
};
