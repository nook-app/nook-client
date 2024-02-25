import { ContentType, PostData } from "@nook/common/types";
import { ScrollView, Text, View, XStack, YStack } from "tamagui";
import { Embed } from "@/components/embeds/Embed";
import { EntityAvatar } from "@/components/entity/EntityAvatar";
import { EntityDisplay } from "../entity/EntityDisplay";
import { Image } from "expo-image";
import { ContentFeedPanel } from "../panels/ContentFeedPanel";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectChannelById } from "@/store/slices/channel";
import { ContentPostText } from "./ContentPostText";
import { ChannelModalButton } from "../buttons/ChannelModalButton";
import { ModalButton } from "../buttons/ModalButton";
import { ModalName } from "@/modals/types";
import { useContent } from "@/hooks/useContent";
import { formatNumber } from "@/utils";

export const ContentPostContent = ({ contentId }: { contentId: string }) => {
  const contentData = useContent(contentId);
  const channel = useAppSelector((state) =>
    content?.data.channelId
      ? selectChannelById(state, content.data.channelId)
      : undefined,
  );

  if (!contentData) return null;

  const { content, context } = contentData;
  return (
    <YStack
      padding="$2"
      gap="$3"
      borderBottomColor="$borderColor"
      borderBottomWidth="$0.5"
    >
      <XStack gap="$2">
        <EntityAvatar entityId={content.data.entityId} />
        <EntityDisplay
          entityId={content.data.entityId}
          orientation="vertical"
        />
      </XStack>
      <ContentPostText data={content.data} />
      {content.data.embeds.map((embed) => (
        <Embed key={embed} embed={embed} data={content.data} />
      ))}
      <XStack gap="$1.5" alignItems="center">
        <Text color="$gray11">
          {new Date(content.data.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        <Text color="$gray11">{"·"}</Text>
        <Text color="$gray11">
          {new Date(content.data.timestamp).toLocaleDateString()}
        </Text>
        {channel && (
          <>
            <Text color="$gray11">{"·"}</Text>
            <ChannelModalButton channelId={channel.contentId}>
              <View borderRadius="$10" overflow="hidden">
                <Image
                  source={{ uri: channel.imageUrl }}
                  style={{ width: 16, height: 16 }}
                />
              </View>
            </ChannelModalButton>
            <ChannelModalButton channelId={channel.contentId}>
              <Text numberOfLines={1} ellipsizeMode="tail">
                {channel.name}
              </Text>
            </ChannelModalButton>
          </>
        )}
      </XStack>
      <XStack gap="$2">
        <View flexDirection="row" alignItems="center" gap="$1">
          <Text fontWeight="700">
            {formatNumber(content.engagement.replies)}
          </Text>
          <Text color="$gray11">Replies</Text>
        </View>
        <ModalButton
          modalName={ModalName.ContentReposts}
          modalArgs={{ contentId: content.data.contentId }}
          disabled={content.engagement.reposts === 0}
        >
          <View flexDirection="row" alignItems="center" gap="$1">
            <Text fontWeight="700">
              {formatNumber(content.engagement.reposts)}
            </Text>
            <Text color="$gray11">Reposts</Text>
          </View>
        </ModalButton>
        <ModalButton
          modalName={ModalName.ContentQuotes}
          modalArgs={{ contentId: content.data.contentId }}
          disabled={content.engagement.embeds === 0}
        >
          <View flexDirection="row" alignItems="center" gap="$1">
            <Text fontWeight="700">
              {formatNumber(content.engagement.embeds)}
            </Text>
            <Text color="$gray11">Quotes</Text>
          </View>
        </ModalButton>
        <ModalButton
          modalName={ModalName.ContentLikes}
          modalArgs={{ contentId: content.data.contentId }}
          disabled={content.engagement.likes === 0}
        >
          <View flexDirection="row" alignItems="center" gap="$1">
            <Text fontWeight="700">
              {formatNumber(content.engagement.likes)}
            </Text>
            <Text color="$gray11">Likes</Text>
          </View>
        </ModalButton>
      </XStack>
    </YStack>
  );
};

export const ContentPost = ({ contentId }: { contentId: string }) => {
  const contentData = useContent(contentId);
  if (!contentData) return null;
  const { content } = contentData;

  return (
    <ScrollView>
      <ContentPostContent contentId={content.contentId} />
      <ContentFeedPanel
        args={{
          filter: {
            type: ContentType.REPLY,
            "data.parentId": content.data.contentId,
          },
          sort: "engagement.likes",
        }}
        asList
      />
    </ScrollView>
  );
};
