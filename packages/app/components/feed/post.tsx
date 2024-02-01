import { FeedItem } from "@flink/api/types";
import { PostActionData } from "@flink/common/types";
import { Image, Text, View } from "tamagui";
import { useWindowDimensions } from "react-native";
import { useEffect, useState } from "react";
import { getTokenValue } from "@tamagui/core";
import { Heart, MessageSquare, RefreshCw } from "@tamagui/lucide-icons";

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

export const FeedPost = ({
  item: { data, entity, entityMap, contentMap },
}: { item: FeedItem<PostActionData> }) => {
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

  const engagement = contentMap[data.contentId].engagement;

  return (
    <View
      padding={paddingContainer}
      borderBottomWidth="$0.25"
      borderBottomColor="$borderColor"
      flexDirection="row"
      gap={gap}
      maxWidth="100%"
    >
      <View width={profileWidth}>
        {entity.farcaster.pfp && (
          <Image
            source={{ width: 40, height: 40, uri: entity.farcaster.pfp }}
            borderRadius="$10"
          />
        )}
      </View>
      <View flexDirection="column" flex={1}>
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
        {data.content.embeds.map((embed, i) => {
          if (embed.includes("imgur.com")) {
            return <FeedEmbedImage key={embed} embed={embed} />;
          }
          return <View key={embed} />;
        })}
        <View
          flexDirection="row"
          justifyContent="space-between"
          width="$16"
          paddingTop="$2"
        >
          <View flexDirection="row" alignItems="center" gap="$2">
            <MessageSquare size={16} color="$color11" />
            <Text color="$color11">{engagement.replies}</Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$2">
            <RefreshCw size={16} color="$color11" />
            <Text color="$color11">{engagement.reposts}</Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$2">
            <Heart size={16} color="$color11" />
            <Text color="$color11">{engagement.likes}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};
