import { Spinner, Text, View } from "tamagui";
import { api } from "../../store/api";
import { ContentFeedItem } from "@flink/api/types";
import { ContentType, PostData } from "@flink/common/types";
import { FeedPost } from "./post";
import { FlatList, Pressable, ViewToken } from "react-native";
import { useCallback, useState } from "react";
import { Link } from "expo-router";

const renderFeedItem = ({ item }: { item: ContentFeedItem }) => {
  if (item.type === ContentType.POST || item.type === ContentType.REPLY) {
    const typedItem = item as ContentFeedItem<PostData>;
    return (
      <Link
        push
        href={{
          pathname: "/(auth)/(nooks)/nooks/content/[id]",
          params: { id: typedItem.contentId },
        }}
        asChild
      >
        <Pressable>
          <FeedPost key={typedItem._id} item={typedItem} />
        </Pressable>
      </Link>
    );
  }
  return <></>;
};

export const Feed = ({
  filter,
  asList,
}: { filter: object; asList?: boolean }) => {
  const [cursor, setCursor] = useState<string>();
  const { data, error, isLoading } = api.useGetContentFeedQuery({
    filter,
    cursor,
  });

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50, // Adjust as needed
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (data && data.length > 5 && viewableItems.length > 0) {
        const lastVisibleItemIndex =
          viewableItems[viewableItems.length - 1].index;
        if (lastVisibleItemIndex && lastVisibleItemIndex >= data.length - 6) {
          // When the last visible item is among the last 5 items
          const newCursor = data[data.length - 1]._id;
          if (newCursor !== cursor) setCursor(newCursor);
        }
      }
    },
    [data, cursor],
  );

  if (error) {
    return <Text>No data</Text>;
  }

  if (isLoading || !data) {
    return (
      <View
        padding="$3"
        alignItems="center"
        backgroundColor="$background"
        alignSelf="center"
        justifyContent="center"
      >
        <Spinner size="large" color="$color11" />
      </View>
    );
  }

  if (asList) {
    return (
      <View>
        {data.map((item) => (
          <View key={item._id}>{renderFeedItem({ item })}</View>
        ))}
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      renderItem={renderFeedItem}
      keyExtractor={(item) => item._id}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
    />
  );
};
