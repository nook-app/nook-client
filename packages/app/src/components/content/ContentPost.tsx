import { ContentFeedItem } from "@nook/api/types";
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

export const ContentPost = ({
  item: { data, engagement },
}: { item: ContentFeedItem<PostData> }) => {
  const channel = useAppSelector((state) =>
    data.channelId ? selectChannelById(state, data.channelId) : undefined,
  );

  return (
    <ScrollView>
      <YStack
        padding="$2"
        gap="$3"
        borderBottomColor="$borderColor"
        borderBottomWidth="$0.5"
      >
        <XStack gap="$2">
          <EntityAvatar entityId={data.entityId} />
          <EntityDisplay entityId={data.entityId} orientation="vertical" />
        </XStack>
        <ContentPostText data={data} />
        {data.embeds.map((embed) => (
          <Embed key={embed} embed={embed} data={data} />
        ))}
        <XStack gap="$1.5" alignItems="center">
          <Text color="$gray11">
            {new Date(data.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          <Text color="$gray11">{"·"}</Text>
          <Text color="$gray11">
            {new Date(data.timestamp).toLocaleDateString()}
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
            <Text fontWeight="700">{engagement.replies}</Text>
            <Text color="$gray11">Replies</Text>
          </View>
          <ModalButton
            modalName={ModalName.ContentReposts}
            modalArgs={{ contentId: data.contentId }}
            disabled={engagement.reposts === 0}
          >
            <View flexDirection="row" alignItems="center" gap="$1">
              <Text fontWeight="700">{engagement.reposts}</Text>
              <Text color="$gray11">Reposts</Text>
            </View>
          </ModalButton>
          <ModalButton
            modalName={ModalName.ContentQuotes}
            modalArgs={{ contentId: data.contentId }}
            disabled={engagement.embeds === 0}
          >
            <View flexDirection="row" alignItems="center" gap="$1">
              <Text fontWeight="700">{engagement.embeds}</Text>
              <Text color="$gray11">Quotes</Text>
            </View>
          </ModalButton>
          <ModalButton
            modalName={ModalName.ContentLikes}
            modalArgs={{ contentId: data.contentId }}
            disabled={engagement.likes === 0}
          >
            <View flexDirection="row" alignItems="center" gap="$1">
              <Text fontWeight="700">{engagement.likes}</Text>
              <Text color="$gray11">Likes</Text>
            </View>
          </ModalButton>
        </XStack>
      </YStack>
      <ContentFeedPanel
        args={{
          filter: {
            type: ContentType.REPLY,
            "data.parentId": data.contentId,
          },
          sort: "engagement.likes",
        }}
        asList
      />
    </ScrollView>
  );
};
