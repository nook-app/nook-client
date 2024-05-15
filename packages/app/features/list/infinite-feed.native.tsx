import { Separator, Spinner, Text, View } from "@nook/app-ui";
import { FlashList } from "@shopify/flash-list";
import { RefreshControl } from "../../components/refresh-control";
import { useCallback, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useScroll } from "../../context/scroll";
import { useScrollToTop } from "@react-navigation/native";
import { useRef } from "react";
import { Tabs } from "react-native-collapsible-tab-view";
import { List } from "@nook/common/types";
import { ListFeedItem } from "./list-feed-item";
import { ListEmptyState } from "./list-empty-state";

export const ListInfiniteFeed = ({
  lists,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
  ListHeaderComponent,
  refetch,
  isRefetching,
  paddingTop,
  paddingBottom,
  asTabs,
}: {
  lists: List[];
  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  ListHeaderComponent?: JSX.Element;
  refetch: () => Promise<void>;
  isRefetching: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  asTabs?: boolean;
}) => {
  const { setIsScrolling } = useScroll();
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

  return (
    <List
      ref={ref}
      data={lists}
      renderItem={({ item }) => <ListFeedItem list={item} />}
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
      onScroll={handleScroll}
      scrollEventThrottle={128}
      contentContainerStyle={{
        paddingTop,
        paddingBottom,
      }}
      ListEmptyComponent={<ListEmptyState />}
    />
  );
};
