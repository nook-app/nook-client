import { Button, Spinner, Text, View, XStack, useTheme } from "tamagui";
import { FlatList, ViewToken } from "react-native";
import { memo, useCallback, useEffect, useState } from "react";
import { nookApi } from "@/store/apis/nookApi";
import { RefreshControl } from "react-native-gesture-handler";
import { ContentFeedArgs, EventAction } from "@nook/common/types";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EntityAvatar } from "../entity/EntityAvatar";
import { EntityDisplay } from "../entity/EntityDisplay";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useEntity } from "@/hooks/useEntity";
import { useAppSelector } from "@/hooks/useAppSelector";

function getNestedValue<T>(obj: T, path: string) {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return path.split(".").reduce((acc: any, part) => acc?.[part], obj);
}

export const EntityListEntry = memo(
  ({ item, entityField }: { item: EventAction; entityField?: string }) => {
    const entityId = !entityField
      ? item.entityId
      : getNestedValue(item, entityField);
    const entity = useEntity(entityId);
    return (
      <View
        alignItems="center"
        flexDirection="row"
        justifyContent="space-between"
        padding="$2"
        paddingHorizontal="$3"
      >
        <XStack gap="$2">
          <EntityAvatar entityId={entityId} />
          <EntityDisplay entityId={entityId} orientation="vertical" />
        </XStack>
        {entity?.context.following ? (
          <Button size="$3" variant="outlined" borderColor="$backgroundHover">
            Unfollow
          </Button>
        ) : (
          <Button size="$3">Follow</Button>
        )}
      </View>
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
  const [accumulatedData, setAccumulatedData] = useState<EventAction[]>([]);
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
      keyExtractor={(item) => item.eventId}
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
