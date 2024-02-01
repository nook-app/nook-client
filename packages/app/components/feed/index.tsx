import { Text, View } from "tamagui";
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

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: Unable to load data</Text>;
  }

  return (
    <View>
      {data && (
        <FlatList
          data={data.data}
          renderItem={renderFeedItem}
          keyExtractor={(item) => item._id}
        />
      )}
    </View>
  );
};
