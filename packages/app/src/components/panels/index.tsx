import { Spinner, Text, View } from "tamagui";
import { ContentFeedItem } from "@flink/api/types";
import { FlatList, ViewToken } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { renderFeedItem } from "../feed";
import { nookApi } from "@/store/apis/nookApi";

export const FeedPanel = ({
  nookId,
  shelfId,
  panelId,
}: { nookId: string; shelfId: string; panelId: string }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [accumulatedData, setAccumulatedData] = useState<ContentFeedItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { data, error, isLoading, isFetching, refetch } =
    nookApi.useGetPanelQuery({
      nookId,
      shelfId,
      panelId,
      cursor,
    });

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
          // When the last visible item is among the last 4 items
          if (data.nextCursor && data.nextCursor !== cursor) {
            setCursor(data.nextCursor);
          }
        }
      }
    },
    [data, accumulatedData, cursor],
  );

  if (isLoading || error || !data) {
    return (
      <View
        padding="$3"
        alignItems="center"
        backgroundColor="$background"
        alignSelf="center"
        justifyContent="center"
        height="100%"
      >
        {isLoading ? (
          <Spinner size="large" color="$color11" />
        ) : (
          <Text>No data found.</Text>
        )}
      </View>
    );
  }

  return (
    <FlatList
      data={accumulatedData}
      renderItem={({ item }) => renderFeedItem(navigation, item)}
      keyExtractor={(item) => item._id}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      ListFooterComponent={() =>
        cursor && isFetching ? (
          <View padding="$2">
            <Spinner color="$color11" />
          </View>
        ) : null
      }
      onRefresh={onRefresh}
      refreshing={refreshing}
    />
  );
};
