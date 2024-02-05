import { FeedItem } from "@flink/api/types";
import { PostActionData } from "@flink/common/types";
import { Image, Text, View, XStack, YStack } from "tamagui";
import { ContentPost } from "../content/post";
import { Embed } from "../embeds";

export const ActionPost = ({
  item: { data, entity, entityMap, contentMap },
}: { item: FeedItem<PostActionData> }) => {
  const engagement = contentMap[data.contentId].engagement;

  return (
    <YStack padding="$2" gap="$3">
      <XStack gap="$2">
        <Image
          source={{ width: 40, height: 40, uri: entity.farcaster.pfp }}
          borderRadius="$10"
        />
        <YStack gap="$1">
          {entity.farcaster.displayName && (
            <Text fontWeight="700">{entity.farcaster.displayName}</Text>
          )}
          {entity.farcaster.username && (
            <Text color="$gray11">{`@${entity.farcaster.username}`}</Text>
          )}
          {!entity.farcaster && <Text color="$gray11">Unknown</Text>}
        </YStack>
      </XStack>
      <ContentPost data={data.content} entityMap={entityMap} />
      {data.content.embeds.map((embed, i) => (
        <Embed
          key={embed}
          embed={embed}
          data={data.content}
          entityMap={entityMap}
          contentMap={contentMap}
        />
      ))}
      <Text color="$gray11">
        {new Date(data.content.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
        {" · "}
        {new Date(data.content.timestamp).toLocaleDateString()}
      </Text>
      <XStack gap="$2">
        <View flexDirection="row" alignItems="center" gap="$1">
          <Text fontWeight="700">{engagement.replies}</Text>
          <Text color="$gray11">Replies</Text>
        </View>
        <View flexDirection="row" alignItems="center" gap="$1">
          <Text fontWeight="700">{engagement.reposts}</Text>
          <Text color="$gray11">Reposts</Text>
        </View>
        <View flexDirection="row" alignItems="center" gap="$1">
          <Text fontWeight="700">{engagement.likes}</Text>
          <Text color="$gray11">Likes</Text>
        </View>
      </XStack>
    </YStack>
  );
};
