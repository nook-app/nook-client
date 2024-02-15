import { ScrollView, Spinner, Text, View } from "tamagui";
import { api } from "@/store/api";
import { ContentFeedItem } from "@flink/api/types";
import { ContentType, PostData } from "@flink/common/types";
import { FeedPost } from "./post";
import { FlatList, ViewToken } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";

export const renderFeedItem = (
  navigation: NavigationProp<RootStackParamList>,
  item: ContentFeedItem,
) => {
  if (item.type === ContentType.POST || item.type === ContentType.REPLY) {
    const typedItem = item as ContentFeedItem<PostData>;
    return (
      <TouchableWithoutFeedback
        onPress={() =>
          navigation.navigate("Content", {
            contentId: typedItem.contentId,
          })
        }
      >
        <FeedPost key={typedItem._id} item={typedItem} />
      </TouchableWithoutFeedback>
    );
  }
  return <></>;
};

export const ContentReplies = ({ contentId }: { contentId: string }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [accumulatedData, setAccumulatedData] = useState<ContentFeedItem[]>([]);

  const { data, error, isLoading, isFetching } = api.useGetContentRepliesQuery({
    contentId,
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
      scrollEnabled={false}
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
    />
  );
};
