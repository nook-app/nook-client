import { ScrollView, Spinner, Text, View, useTheme } from "tamagui";
import { ViewToken } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl } from "react-native-gesture-handler";
import {
  FarcasterCastResponseWithContext,
  FarcasterFeedArgs,
} from "@nook/common/types";
import { Tabs } from "react-native-collapsible-tab-view";
import { farcasterApi } from "@/store/apis/farcasterApi";
import { FarcasterFeedItem } from "../farcaster/FarcasterFeedItem";

export const FarcasterFeedPanel = ({
  args,
  asTabs,
}: { args: FarcasterFeedArgs; asTabs?: boolean }) => {
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [accumulatedData, setAccumulatedData] = useState<
    FarcasterCastResponseWithContext[]
  >([]);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const { data, error, isLoading, isFetching, refetch } =
    farcasterApi.useGetFeedQuery({ ...args, cursor });

  // biome-ignore lint/correctness/useExhaustiveDependencies: don't need to depend on cursor
  useEffect(() => {
    if (data && !isLoading) {
      if (!cursor) {
        setAccumulatedData(data.data);
      } else {
        setAccumulatedData((currentData) => [...currentData, ...data.data]);
      }
    }
  }, [data, isLoading]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCursor(undefined);
    refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50, // Adjust as needed
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (
        accumulatedData &&
        data &&
        accumulatedData.length > 3 &&
        viewableItems.length > 0
      ) {
        const lastVisibleItemIndex =
          viewableItems[viewableItems.length - 1].index;
        if (
          lastVisibleItemIndex &&
          lastVisibleItemIndex >= accumulatedData.length - 4
        ) {
          if (data.nextCursor && data.nextCursor !== cursor) {
            setCursor(data.nextCursor);
          }
          cursor;
        }
      }
    },
    [data, accumulatedData, cursor],
  );

  if (isLoading || !data) {
    const ScrollViewComponent = asTabs ? Tabs.ScrollView : ScrollView;
    return (
      <ScrollViewComponent>
        <View padding="$5" alignItems="center" backgroundColor="$background">
          {isLoading ? (
            <Spinner size="large" color="$color11" />
          ) : (
            <Text>No data found.</Text>
          )}
        </View>
      </ScrollViewComponent>
    );
  }

  const FlatListComponent = asTabs ? Tabs.FlatList : FlatList;

  return (
    <FlatListComponent
      nestedScrollEnabled
      data={accumulatedData}
      renderItem={({ item }) => (
        <FarcasterFeedItem key={item.hash} cast={item} />
      )}
      keyExtractor={(item) => item.hash}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      ListFooterComponent={() =>
        cursor && isFetching ? (
          <View padding="$2">
            <Spinner color="$color11" />
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          colors={[theme.color11.val]}
          tintColor={theme.color11.val}
          onRefresh={onRefresh}
          refreshing={refreshing}
        />
      }
    />
  );
};
