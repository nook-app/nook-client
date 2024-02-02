import { FeedItem, FeedItemContentWithEngagement } from "@flink/api/types";
import { Entity, PostActionData, PostData } from "@flink/common/types";
import { Image, View, XStack, YStack } from "tamagui";
import { useWindowDimensions } from "react-native";
import { useEffect, useState } from "react";
import { getTokenValue } from "@tamagui/core";
import { Heart, MessageSquare, RefreshCw } from "@tamagui/lucide-icons";
import { Text } from "../ui/text";

const paddingContainer = "$2";
const profileWidth = "$3.5";
const gap = "$2";

const FeedEmbedImage = ({ embed }: { embed: string }) => {
  const { width: dWidth } = useWindowDimensions();
  const [height, setHeight] = useState(100);

  const width =
    dWidth -
    getTokenValue(paddingContainer, "space") * 2 -
    getTokenValue(profileWidth, "size") -
    getTokenValue(gap, "space");

  useEffect(() => {
    if (embed) {
      Image.getSize(embed, (w, h) => {
        setHeight((h / w) * width);
      });
    }
  }, [embed, width]);

  return (
    <View borderRadius="$2" overflow="hidden" marginTop="$2">
      <Image source={{ width, height, uri: embed }} />
    </View>
  );
};

const FeedEmbedQuote = ({
  data,
  entityMap,
  contentMap,
}: {
  data: PostData;
  entityMap: Record<string, Entity>;
  contentMap: Record<string, FeedItemContentWithEngagement>;
}) => {
  const entity = entityMap[data.entityId.toString()];
  return (
    <YStack
      borderWidth="$0.75"
      borderColor="$borderColor"
      borderRadius="$2"
      padding="$2.5"
      marginVertical="$2"
      gap="$2"
    >
      <XStack gap="$1" alignItems="center">
        {entity?.farcaster.pfp && (
          <View marginRight="$1">
            <Image
              source={{ width: 20, height: 20, uri: entity.farcaster.pfp }}
              borderRadius="$10"
            />
          </View>
        )}
        {entity?.farcaster.displayName && (
          <Text bold>{entity.farcaster.displayName}</Text>
        )}
        {entity?.farcaster.username && (
          <Text>{`@${entity.farcaster.username}`}</Text>
        )}
        {!entity && <Text bold>{data.entityId.toString()}</Text>}
      </XStack>
      <FeedPostContent data={data} entityMap={entityMap} />
      <FeedPostEmbeds
        data={data}
        entityMap={entityMap}
        contentMap={contentMap}
      />
    </YStack>
  );
};

const FeedPostContent = ({
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
      if (/https?:\/\/[^\s]+/.test(part)) {
        if (data.embeds.includes(part)) {
          continue;
        }

        splitParts.push(
          <Text key={Math.random().toString(16)} highlight>
            {part}
          </Text>,
        );
      } else {
        splitParts.push(<Text key={Math.random().toString(16)}>{part}</Text>);
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
      <Text key={Math.random().toString(16)} highlight>
        {label}
      </Text>,
    );
    index = mention.position;
  }

  textParts.push(...splitLinkParts(data.text.substring(0, index)));

  if (data.mentions.length > 0) {
    textParts.reverse();
  }

  return <Text>{textParts}</Text>;
};

const FeedPostEmbeds = ({
  data,
  entityMap,
  contentMap,
}: {
  data: PostData;
  entityMap: Record<string, Entity>;
  contentMap: Record<string, FeedItemContentWithEngagement>;
}) => {
  return (
    <>
      {data.embeds.map((embed, i) => {
        if (embed.includes("imgur.com")) {
          return <FeedEmbedImage key={embed} embed={embed} />;
        }
        if (embed.startsWith("farcaster://") && contentMap[embed]?.content) {
          return (
            <FeedEmbedQuote
              key={embed}
              data={contentMap[embed].content?.data as PostData}
              entityMap={entityMap}
              contentMap={contentMap}
            />
          );
        }
        return <Text key={embed}>{embed}</Text>;
      })}
    </>
  );
};

export const FeedPost = ({
  item: { data, entity, entityMap, contentMap },
}: { item: FeedItem<PostActionData> }) => {
  const engagement = contentMap[data.contentId].engagement;

  return (
    <XStack
      padding={paddingContainer}
      borderBottomWidth="$0.25"
      borderBottomColor="$borderColor"
      gap={gap}
    >
      <View width={profileWidth}>
        {entity.farcaster.pfp && (
          <Image
            source={{ width: 40, height: 40, uri: entity.farcaster.pfp }}
            borderRadius="$10"
          />
        )}
      </View>
      <YStack flex={1} gap="$1">
        <XStack gap="$1">
          {entity.farcaster.displayName && (
            <Text bold>{entity.farcaster.displayName}</Text>
          )}
          {entity.farcaster.username && (
            <Text muted>{`@${entity.farcaster.username}`}</Text>
          )}
        </XStack>
        <FeedPostContent data={data.content} entityMap={entityMap} />
        <FeedPostEmbeds
          data={data.content}
          entityMap={entityMap}
          contentMap={contentMap}
        />
        <XStack justifyContent="space-between" width="$16" marginTop="$2">
          <View flexDirection="row" alignItems="center" gap="$2">
            <MessageSquare size={16} color="$gray11" />
            <Text muted>{engagement.replies}</Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$2">
            <RefreshCw size={16} color="$gray11" />
            <Text muted>{engagement.reposts}</Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$2">
            <Heart size={16} color="$gray11" />
            <Text muted>{engagement.likes}</Text>
          </View>
        </XStack>
      </YStack>
    </XStack>
  );
};
