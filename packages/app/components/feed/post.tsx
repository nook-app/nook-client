import { FeedItem } from "@flink/api/types";
import { PostActionData } from "@flink/common/types";
import { Image, Text, View, XStack, YStack } from "tamagui";
import { Heart, MessageSquare, RefreshCw } from "@tamagui/lucide-icons";
import { ContentPost } from "../content/post";
import { Embed } from "../embeds";

function formatTimeAgo(date: string) {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000,
  );
  let interval = seconds / 31536000;

  if (interval > 1) {
    return `${Math.floor(interval)}y`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return `${Math.floor(interval)}m`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return `${Math.floor(interval)}d`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return `${Math.floor(interval)}h`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    return `${Math.floor(interval)}m`;
  }

  return `${Math.floor(interval)}s`;
}

export const FeedPost = ({
  item: { data, entity, entityMap, contentMap },
}: { item: FeedItem<PostActionData> }) => {
  const engagement = contentMap[data.contentId].engagement;

  return (
    <XStack
      padding="$2"
      borderBottomWidth="$0.25"
      borderBottomColor="$borderColor"
      gap="$2"
    >
      <View width="$3.5">
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
            <Text fontWeight="700">{entity.farcaster.displayName}</Text>
          )}
          {entity.farcaster.username && (
            <Text color="$gray11">{`@${entity.farcaster.username}`}</Text>
          )}
          {!entity && <Text fontWeight="700">{data.entityId.toString()}</Text>}
          <Text color="$gray11">{" · "}</Text>
          <Text color="$gray11">
            {formatTimeAgo(data.content.timestamp as unknown as string)}
          </Text>
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
        <XStack justifyContent="space-between" width="$16" marginTop="$2">
          <View flexDirection="row" alignItems="center" gap="$2">
            <MessageSquare size={16} color="$gray11" />
            <Text color="$gray11">{engagement.replies}</Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$2">
            <RefreshCw size={16} color="$gray11" />
            <Text color="$gray11">{engagement.reposts}</Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$2">
            <Heart size={16} color="$gray11" />
            <Text color="$gray11">{engagement.likes}</Text>
          </View>
        </XStack>
      </YStack>
    </XStack>
  );
};
