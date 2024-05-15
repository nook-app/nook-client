import { Transaction } from "@nook/common/types";
import { Separator, Spinner, View } from "@nook/app-ui";
import { FlashList } from "@shopify/flash-list";
import { useCallback, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useScrollToTop } from "@react-navigation/native";
import { useRef } from "react";
import { Tabs } from "react-native-collapsible-tab-view";
import { useScroll } from "../../context/scroll";
import { RefreshControl } from "../../components/refresh-control";
import { TransactionLink } from "./transaction-link";

export const TransactionInfiniteFeed = ({
  transactions,
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
  transactions: Transaction[];
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
      data={transactions}
      renderItem={({ item }) => (
        <TransactionLink transaction={item as Transaction} />
      )}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        isFetchingNextPage ? (
          <View marginVertical="$3">
            <Spinner />
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          paddingTop={paddingTop}
        />
      }
      ItemSeparatorComponent={() => (
        <Separator width="100%" borderBottomColor="$borderColorBg" />
      )}
      onEndReached={fetchNextPage}
      onEndReachedThreshold={5}
      estimatedItemSize={300}
      onScroll={handleScroll}
      scrollEventThrottle={128}
      contentContainerStyle={{
        paddingTop,
        paddingBottom,
      }}
    />
  );
};
