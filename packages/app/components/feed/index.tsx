import { Spinner, Text, View, XStack, YStack } from "tamagui";
import { api } from "../../store/api";
import { FeedItem } from "@flink/api/types";
import { EventActionType, PostActionData } from "@flink/common/types";
import { FeedPost } from "./post";
import { FlatList } from "react-native";

const renderFeedItem = ({ item }: { item: FeedItem }) => {
  if (item.type === EventActionType.POST) {
    return <FeedPost key={item._id} item={item as FeedItem<PostActionData>} />;
  }
  return <></>;
};

export const Feed = ({ filter }: { filter: object }) => {
  const { data, error, isLoading } = api.useGetFeedForFilterQuery({
    filter,
  });

  if (error) {
    return <Text>No data</Text>;
  }

  if (isLoading || !data) {
    return (
      <XStack
        padding="$3"
        justifyContent="center"
        alignItems="center"
        height="100%"
        theme="blue"
        backgroundColor="$background"
      >
        <Spinner size="large" color="$color11" />
      </XStack>
    );
  }

  return (
    <FlatList
      data={data.data}
      renderItem={renderFeedItem}
      keyExtractor={(item) => item._id}
    />
  );
};
