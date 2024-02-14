import { ContentFeedItem } from "@flink/api/types";
import { PostData } from "@flink/common/types";
import { Text, View, XStack, YStack } from "tamagui";
import { Heart, MessageSquare, RefreshCw, Tv } from "@tamagui/lucide-icons";
import { Embed } from "@/components/embeds";
import { EntityAvatar } from "@/components/entity/avatar";
import {
  PostContent,
  formatTimeAgo,
  formatTipsAmount,
} from "@/components/utils";
import { EntityDisplay } from "../entity/display";
import { CHANNELS } from "@/constants";
import { Image } from "expo-image";

export const FeedPost = ({
  item: { data, timestamp, entityMap, contentMap },
}: { item: ContentFeedItem<PostData> }) => {
  const engagement = contentMap[data.contentId].engagement;
  const tips = contentMap[data.contentId].tips;
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
        <XStack justifyContent="space-between" marginTop="$2" paddingRight="$2">
          <View flexDirection="row" alignItems="center" gap="$2" width="$6">
            <MessageSquare size={16} color="$gray11" />
            <Text color="$gray11">{engagement.replies}</Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$2" width="$6">
            <RefreshCw size={16} color="$gray11" />
            <Text color="$gray11">{engagement.reposts}</Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$2" width="$6">
            <Heart size={16} color="$gray11" />
            <Text color="$gray11">{engagement.likes}</Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$2" width="$6">
            <Image
              source={{ uri: "https://www.degen.tips/logo_light.svg" }}
              style={{ width: 12, height: 12 }}
            />
            <Text color="$gray11">
              {formatTipsAmount(
                tips
                  ? tips[
                      "chain://eip155:8453/erc20:0xc9034c3e7f58003e6ae0c8438e7c8f4598d5acaa"
                    ]?.amount || 0
                  : 0,
              )}
            </Text>
          </View>
          <View
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-end"
            gap="$1.5"
            flex={1}
          >
            {data.channelId && CHANNELS[data.channelId] && (
              <>
                <Text color="$gray11">in</Text>
                <Text numberOfLines={1} ellipsizeMode="tail" fontWeight="700">
                  {CHANNELS[data.channelId].name}
                </Text>
              </>
            )}
          </View>
        </XStack>
      </YStack>
    </XStack>
  );
};
