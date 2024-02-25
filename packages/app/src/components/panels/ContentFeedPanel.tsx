import { Spinner, Text, View, useTheme } from "tamagui";
import { FlatList, ViewToken } from "react-native";
import { memo, useCallback, useEffect, useState } from "react";
import { nookApi } from "@/store/apis/nookApi";
import { RefreshControl } from "react-native-gesture-handler";
import { ContentPostCompact } from "../content/ContentPostCompact";
import {
  Content,
  ContentFeedArgs,
  ContentType,
  PostData,
} from "@nook/common/types";
import { ContentReplyCompact } from "../content/ContentReplyCompact";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { Tabs } from "react-native-collapsible-tab-view";

export const ContentFeedEntry = memo(
  ({
    item,
    replyAsPost,
  }: { item: Content<PostData>; replyAsPost?: boolean }) => {
    if (
      item.type === ContentType.POST ||
      (item.type === ContentType.REPLY && replyAsPost)
    ) {
      return (
        <ContentPostCompact key={item.contentId} contentId={item.contentId} />
      );
    }

    if (item.type === ContentType.REPLY) {
      return (
        <ContentReplyCompact key={item.contentId} contentId={item.contentId} />
      );
    }

    return <></>;
  },
);

export const ContentFeedPanel = ({
  args,
  asList,
  asTabs,
}: { args: ContentFeedArgs; asList?: boolean; asTabs?: boolean }) => {
  const insets = useSafeAreaInsets();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [accumulatedData, setAccumulatedData] = useState<Content[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const theme = useTheme();

  const { data, error, isLoading, isFetching, refetch } =
    nookApi.useGetContentFeedQuery({
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
    const Wrapper = asTabs ? Tabs.ScrollView : View;
    return (
      <Wrapper>
        <View padding="$5" alignItems="center" backgroundColor="$background">
          {isLoading ? (
            <Spinner size="large" color="$color11" />
          ) : (
            <Text>No data found.</Text>
          )}
        </View>
      </Wrapper>
    );
  }

  if (asList) {
    return (
      <View paddingBottom={insets.bottom}>
        {accumulatedData.map((item) => (
          <ContentFeedEntry
            key={item.contentId}
            item={item as Content<PostData>}
            replyAsPost
          />
        ))}
      </View>
    );
  }

  const FlatListCompnent = asTabs ? Tabs.FlatList : FlatList;

  return (
    <FlatListCompnent
      nestedScrollEnabled
      data={accumulatedData}
      renderItem={({ item }) => (
        <ContentFeedEntry item={item as Content<PostData>} />
      )}
      keyExtractor={(item) => item.contentId}
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
