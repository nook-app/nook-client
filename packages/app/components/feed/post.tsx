import { FeedItem } from "@flink/api/types";
import { PostActionData } from "@flink/common/types";
import { Image, View, XStack, YStack } from "tamagui";
import { getTokenValue } from "@tamagui/core";
import { Heart, MessageSquare, RefreshCw } from "@tamagui/lucide-icons";
import { Text } from "../ui/text";
import { ContentPost } from "../content/post";
import { Embed } from "../embeds";

const paddingContainer = "$2";
const profileWidth = "$3.5";
const gap = "$2";

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
        <ContentPost data={data.content} entityMap={entityMap} />
        {data.content.embeds.map((embed, i) => (
          <Embed
            key={embed}
            embed={embed}
            entityMap={entityMap}
            contentMap={contentMap}
            widthOffset={
              getTokenValue(paddingContainer, "space") * 2 +
              getTokenValue(profileWidth, "size") +
              getTokenValue(gap, "space")
            }
          />
        ))}
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
