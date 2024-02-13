import { ContentFeedItem } from "@flink/api/types";
import { PostData } from "@flink/common/types";
import { Text, View, XStack, YStack } from "tamagui";
import { Heart, MessageSquare, RefreshCw } from "@tamagui/lucide-icons";
import { Embed } from "@/components/embeds";
import { EntityAvatar } from "@/components/entity/avatar";
import { PostContent } from "@/components/utils";
import { EntityDisplay } from "../entity/display";

function formatTimeAgo(date: string) {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000,
  );
  let interval = seconds / 86400; // Days

  if (interval > 30) {
    const dateObj = new Date(date);
    return `${dateObj.toLocaleString("default", {
      month: "short",
    })} ${dateObj.getDate()}`;
  }
  if (interval > 1) {
    return `${Math.floor(interval)}d`;
  }
  interval = seconds / 3600; // Hours
  if (interval > 1) {
    return `${Math.floor(interval)}h`;
  }
  interval = seconds / 60; // Minutes
  if (interval > 1) {
    return `${Math.floor(interval)}m`;
  }

  return `${Math.floor(seconds)}s`; // Seconds
}

export const FeedPost = ({
  item: { data, timestamp, entityMap, contentMap },
}: { item: ContentFeedItem<PostData> }) => {
  const engagement = contentMap[data.contentId].engagement;
  const entity = entityMap[data.entityId.toString()];

  return (
    <XStack
      padding="$2"
      borderBottomWidth="$0.25"
      borderBottomColor="$borderColor"
      gap="$2"
    >
      <View width="$3.5">
        <EntityAvatar entity={entity} />
      </View>
      <YStack flex={1} gap="$1">
        <XStack gap="$1">
          <EntityDisplay entity={entity} />
          <Text color="$gray11">{" · "}</Text>
          <Text color="$gray11">
            {formatTimeAgo(timestamp as unknown as string)}
          </Text>
        </XStack>
        <PostContent data={data} entityMap={entityMap} />
        {data.embeds.map((embed, i) => (
          <Embed
            key={embed}
            embed={embed}
            data={data}
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
