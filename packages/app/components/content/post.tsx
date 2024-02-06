import { ContentFeedItem } from "@flink/api/types";
import { Entity, PostActionData, PostData } from "@flink/common/types";
import { Image, ScrollView, Text, View, XStack, YStack } from "tamagui";
import { Embed } from "../embeds";
import { Feed } from "../feed";
import { Linking } from "react-native";

export const PostContent = ({
  data,
  entityMap,
}: {
  data: PostData;
  entityMap: Record<string, Entity>;
}) => {
  const textParts = [];

  const splitLinkParts = (text: string) => {
    const splitParts = [];
    for (const part of text.split(/(https?:\/\/[^\s]+)/g)) {
      if (!part) continue;
      if (/https?:\/\/[^\s]+/.test(part)) {
        if (data.embeds.includes(part)) {
          continue;
        }

        splitParts.push(
          <Text
            key={`${data.contentId}-${part}`}
            color="$color10"
            onPress={() => Linking.openURL(part)}
          >
            {part}
          </Text>,
        );
      } else {
        splitParts.push(<Text key={`${data.contentId}-${part}`}>{part}</Text>);
      }
    }
    return splitParts;
  };

  let index = data.text.length;
  const sortedMentions = [...data.mentions].sort(
    (a, b) => b.position - a.position,
  );
  for (const mention of sortedMentions) {
    const mentionedEntity = entityMap[mention.entityId.toString()];
    const label = `@${
      mentionedEntity?.farcaster?.username ||
      mentionedEntity?.farcaster?.fid ||
      mention.entityId.toString()
    }`;

    textParts.push(
      ...splitLinkParts(data.text.substring(mention.position, index)),
    );
    textParts.push(
      <Text key={`${data.contentId}-${label}`} color="$color10">
        {label}
      </Text>,
    );
    index = mention.position;
  }

  if (index > 0) {
    textParts.push(...splitLinkParts(data.text.substring(0, index)));
  }

  if (data.mentions.length > 0) {
    textParts.reverse();
  }

  if (textParts.length === 0) {
    return null;
  }

  return <Text>{textParts}</Text>;
};

export const ContentPost = ({
  item: { data, entity, entityMap, contentMap },
}: { item: ContentFeedItem<PostActionData> }) => {
  const engagement = contentMap[data.contentId].engagement;

  return (
    <ScrollView>
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
        <PostContent data={data.content} entityMap={entityMap} />
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
        <Feed
          filter={{
            type: "REPLY",
            deletedAt: null,
            topics: {
              type: "TARGET_CONTENT",
              value: data.contentId,
            },
          }}
          asList
        />
      </YStack>
    </ScrollView>
  );
};
