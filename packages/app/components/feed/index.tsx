import { Text, View } from "tamagui";
import { api } from "../../store/api";
import { GetFeedResponseItem } from "@flink/api/types";
import { EventActionType, PostActionData } from "@flink/common/types";
import { FeedPost } from "./post";
import { FlatList } from "react-native";

const renderFeedItem = ({ item }: { item: GetFeedResponseItem }) => {
  if (item.type === EventActionType.POST) {
    return <FeedPost item={item as GetFeedResponseItem<PostActionData>} />;
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
