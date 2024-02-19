import { ContentFeedItem } from "@nook/api/types";
import { PostData } from "@nook/common/types";
import { Text, View, XStack, YStack } from "tamagui";
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
import { Heart, MessageSquare, RefreshCw } from "@tamagui/lucide-icons";

export const ContentPostCompact = ({
  item: { data, timestamp, engagement, tips },
}: { item: ContentFeedItem<PostData> }) => {
  const degenTips =
    tips["chain://eip155:8453/erc20:0xc9034c3e7f58003e6ae0c8438e7c8f4598d5acaa"]
      ?.amount || 0;

  return (
    <XStack
      padding="$2"
      borderBottomWidth="$0.25"
      borderBottomColor="$borderColor"
      gap="$2"
    >
      <View width="$3.5">
        <EntityAvatar entityId={data.entityId?.toString()} />
      </View>
      <YStack flex={1} gap="$0.5">
        <EntityDisplay entityId={data.entityId?.toString()} />
        <XStack alignItems="center" gap="$1.5" paddingBottom="$2">
          <Text color="$gray11">
            {`${formatTimeAgo(timestamp as unknown as string)} ago`}
          </Text>
          {data.channelId && CHANNELS[data.channelId] && (
            <>
              <Text color="$gray11">in</Text>
              <View borderRadius="$10" overflow="hidden">
                <Image
                  source={{ uri: CHANNELS[data.channelId]?.imageUrl }}
                  style={{ width: 16, height: 16 }}
                />
              </View>
              <Text numberOfLines={1} ellipsizeMode="tail" fontWeight="500">
                {CHANNELS[data.channelId].name}
              </Text>
            </>
          )}
        </XStack>
        <PostContent data={data} />
        {data.embeds.map((embed, i) => (
          <Embed key={embed} embed={embed} data={data} />
        ))}
        <XStack justifyContent="space-between" marginTop="$2" width="$20">
          <View flexDirection="row" alignItems="center" gap="$2" width="$5">
            <MessageSquare size={16} color="$gray11" />
            <Text color="$gray11">{engagement.replies}</Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$2" width="$5">
            <RefreshCw size={16} color="$gray11" />
            <Text color="$gray11">{engagement.reposts}</Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$2" width="$5">
            <Heart size={16} color="$gray11" />
            <Text color="$gray11">{engagement.likes}</Text>
          </View>
          {degenTips > 0 && (
            <View flexDirection="row" alignItems="center" gap="$2" width="$5">
              <Image
                source={{ uri: "https://www.degen.tips/logo_light.svg" }}
                style={{ width: 12, height: 12 }}
              />
              <Text color="$gray11">{formatTipsAmount(degenTips)}</Text>
            </View>
          )}
        </XStack>
      </YStack>
    </XStack>
  );
};
