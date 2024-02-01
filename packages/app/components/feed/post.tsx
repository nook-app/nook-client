import { GetFeedResponseItem } from "@flink/api/types";
import { PostActionData } from "@flink/common/types";
import { Image, Text, View } from "tamagui";

export const FeedPost = ({
  item: { data, entity, entityMap },
}: { item: GetFeedResponseItem<PostActionData> }) => {
  const formattedText = [];

  if (data.content.mentions.length === 0) {
    formattedText.push(
      <Text key={Math.random().toString(16)}>{data.content.text}</Text>,
    );
  } else {
    let index = data.content.text.length;
    const sortedMentions = [...data.content.mentions].sort(
      (a, b) => b.position - a.position,
    );
    for (const mention of sortedMentions) {
      const mentionedEntity = entityMap[mention.entityId.toString()];
      const label = `@${
        mentionedEntity.farcaster.username || mentionedEntity.farcaster.fid
      }`;

      formattedText.push(
        <Text key={Math.random().toString(16)}>
          {data.content.text.substring(mention.position, index)}
        </Text>,
        <Text key={Math.random().toString(16)} color="$pink11">
          {label}
        </Text>,
      );
      index = mention.position;
    }
    formattedText.push(
      <Text key={Math.random().toString(16)}>
        {data.content.text.substring(0, index)}
      </Text>,
    );
    formattedText.reverse();
  }

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
          <Text>{formattedText}</Text>
        </View>
      </View>
    </View>
  );
};
