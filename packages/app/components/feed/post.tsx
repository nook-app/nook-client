import { GetFeedResponseItem } from "@flink/api/types";
import { PostActionData } from "@flink/common/types";
import { Image, Text, View } from "tamagui";

export const FeedPost = ({
  item: { data, entity },
}: { item: GetFeedResponseItem<PostActionData> }) => {
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
          <Text>{data.content.text}</Text>
        </View>
      </View>
    </View>
  );
};
