import { Spinner, Text, View, XStack, useTheme } from "tamagui";
import { FlatList, ViewToken } from "react-native";
import { memo, useCallback, useEffect, useState } from "react";
import { nookApi } from "@/store/apis/nookApi";
import { RefreshControl } from "react-native-gesture-handler";
import { ActionFeedItem } from "@nook/api/types";
import { ContentFeedArgs } from "@nook/common/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EntityAvatar } from "../entity/EntityAvatar";
import { EntityDisplay } from "../entity/EntityDisplay";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";

function getNestedValue<T>(obj: T, path: string) {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return path.split(".").reduce((acc: any, part) => acc?.[part], obj);
}

export const EntityListEntry = memo(
  ({ item, entityField }: { item: ActionFeedItem; entityField?: string }) => {
    return (
      <XStack gap="$2" padding="$2">
        <EntityAvatar
          entityId={
            !entityField ? item.entityId : getNestedValue(item, entityField)
          }
        />
        <EntityDisplay
          entityId={
            !entityField ? item.entityId : getNestedValue(item, entityField)
          }
          orientation="vertical"
        />
      </XStack>
    );
  },
);

export const EntityListPanel = ({
  args,
  entityField,
  isBottomSheet,
}: {
  args: ContentFeedArgs;
  entityField?: string;
  isBottomSheet?: boolean;
}) => {
  const insets = useSafeAreaInsets();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [accumulatedData, setAccumulatedData] = useState<ActionFeedItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const { data, error, isLoading, isFetching, refetch } =
    nookApi.useGetActionsFeedQuery({
      ...args,
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

  const FlatListComponent = isBottomSheet ? BottomSheetFlatList : FlatList;

  return (
    <FlatListComponent
      data={accumulatedData}
      renderItem={({ item }) => (
        <EntityListEntry item={item} entityField={entityField} />
      )}
      keyExtractor={(item) => item._id.toString()}
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
      contentContainerStyle={{ paddingBottom: insets.bottom }}
    />
  );
};
