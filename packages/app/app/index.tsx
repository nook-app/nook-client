import { FlatList, ListRenderItemInfo } from "react-native";
import { feeds } from "../store/feeds";
import { FeedResponseItem } from "@flink/api/types";
import { Image, Text, View } from "tamagui";
import { PostActionData } from "@flink/common/types";

export default function Home() {
  const { data, error, isLoading } = feeds.useGetFeedsQuery({});

  if (isLoading) return <Text>Loading...</Text>;
  if (error) {
    const errorMessage =
      "message" in error
        ? error.message
        : "error" in error
          ? error.error
          : "unknown";
    return <Text>{errorMessage}</Text>;
  }

  const renderItem = ({
    item: { entity, data },
  }: ListRenderItemInfo<FeedResponseItem>) => {
    const postData = data as PostActionData;
    return (
      <View
        paddingVertical="$3"
        paddingHorizontal="$2"
        borderBottomWidth="$0.25"
        borderBottomColor="$borderColor"
        flexDirection="row"
        gap="$2"
      >
        {entity.farcaster.pfp && (
          <Image
            source={{ width: 40, height: 40, uri: entity.farcaster.pfp }}
            borderRadius="$10"
          />
        )}
        <View flexDirection="column">
          <View flexDirection="row" gap="$1">
            {entity.farcaster.displayName && (
              <Text fontWeight="700">{entity.farcaster.displayName}</Text>
            )}
            {entity.farcaster.username && (
              <Text color="$color11">{`@${entity.farcaster.username}`}</Text>
            )}
          </View>
          <View>
            <Text>{postData.content.text}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View>
      {data && (
        <FlatList
          data={data.data}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
        />
      )}
    </View>
  );
}
