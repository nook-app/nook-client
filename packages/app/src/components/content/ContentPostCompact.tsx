import { ContentFeedItem } from "@nook/api/types";
import { PostData } from "@nook/common/types";
import { Text, View, XStack, YStack } from "tamagui";
import { Embed } from "@/components/embeds/Embed";
import { EntityAvatar } from "@/components/entity/EntityAvatar";
import {
  ContentPostText,
  formatTimeAgo,
} from "@/components/content/ContentPostText";
import { EntityDisplay } from "../entity/EntityDisplay";
import { Image } from "expo-image";
import { Heart, MessageSquare, RefreshCw } from "@tamagui/lucide-icons";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectChannelById } from "@/store/slices/channel";
import { ChannelModalButton } from "../channel/ChannelModalButton";

export const ContentPostCompact = ({
  item: { data, timestamp, engagement },
}: { item: ContentFeedItem<PostData> }) => {
  const channel = useAppSelector((state) =>
    data.channelId ? selectChannelById(state, data.channelId) : undefined,
  );

  return (
    <XStack
      padding="$2"
      borderBottomWidth="$0.25"
      borderBottomColor="$borderColor"
      gap="$2"
    >
      <View width="$3.5">
        <EntityAvatar entityId={data.entityId} />
      </View>
      <YStack flex={1} gap="$0.5">
        <EntityDisplay entityId={data.entityId} />
        <XStack alignItems="center" gap="$1.5" paddingBottom="$2">
          <Text color="$gray11">
            {`${formatTimeAgo(timestamp as unknown as string)} ago`}
          </Text>
          {channel && (
            <>
              <Text color="$gray11">in</Text>
              <ChannelModalButton channelId={channel.contentId}>
                <View borderRadius="$10" overflow="hidden">
                  <Image
                    source={{ uri: channel.imageUrl }}
                    style={{ width: 16, height: 16 }}
                  />
                </View>
              </ChannelModalButton>
              <ChannelModalButton channelId={channel.contentId}>
                <Text numberOfLines={1} ellipsizeMode="tail" fontWeight="500">
                  {channel.name}
                </Text>
              </ChannelModalButton>
            </>
          )}
        </XStack>
        <ContentPostText data={data} />
        {data.embeds.map((embed) => (
          <Embed key={embed} embed={embed} data={data} />
        ))}
        <XStack justifyContent="space-between" marginTop="$2" width="$15">
          <View flexDirection="row" alignItems="center" gap="$1.5" width="$3">
            <MessageSquare size={14} color="$gray9" />
            <Text color="$gray9" fontSize="$3">
              {engagement.replies}
            </Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$1.5" width="$3">
            <RefreshCw size={14} color="$gray9" />
            <Text color="$gray9" fontSize="$3">
              {engagement.reposts}
            </Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$1.5" width="$3">
            <Heart size={14} color="$gray9" />
            <Text color="$gray9" fontSize="$3">
              {engagement.likes}
            </Text>
          </View>
        </XStack>
      </YStack>
    </XStack>
  );
};
