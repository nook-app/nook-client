import { ContentType, NookPanelType } from "@nook/common/types";
import { ScrollView, Text, View, XStack, YStack } from "tamagui";
import { Embed } from "@/components/embeds/Embed";
import { EntityAvatar } from "@/components/entity/EntityAvatar";
import { EntityDisplay } from "../entity/EntityDisplay";
import { ContentFeedPanel } from "../panels/ContentFeedPanel";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectChannelById } from "@/store/slices/channel";
import { ContentPostText } from "./ContentPostText";
import { useContent } from "@/hooks/useContent";
import { formatNumber } from "@/utils";
import { ChannelDisplay } from "../channel/ChannelDisplay";
import { TouchableOpacity } from "react-native-gesture-handler";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";

export const ContentPostContent = ({ contentId }: { contentId: string }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const contentData = useContent(contentId);
  if (!contentData) return null;

  const { content, context } = contentData;

  const channel = useAppSelector((state) =>
    content.data.channelId
      ? selectChannelById(state, content.data.channelId)
      : undefined,
  );

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
            <ChannelDisplay channel={channel} />
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
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ContentReposts", {
              contentId: content.contentId,
            })
          }
        >
          <View flexDirection="row" alignItems="center" gap="$1">
            <Text fontWeight="700">
              {formatNumber(content.engagement.reposts)}
            </Text>
            <Text color="$gray11">Reposts</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ContentQuotes", {
              contentId: content.contentId,
            })
          }
        >
          <View flexDirection="row" alignItems="center" gap="$1">
            <Text fontWeight="700">
              {formatNumber(content.engagement.embeds)}
            </Text>
            <Text color="$gray11">Quotes</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ContentLikes", {
              contentId: content.contentId,
            })
          }
        >
          <View flexDirection="row" alignItems="center" gap="$1">
            <Text fontWeight="700">
              {formatNumber(content.engagement.likes)}
            </Text>
            <Text color="$gray11">Likes</Text>
          </View>
        </TouchableOpacity>
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
        panel={{
          type: NookPanelType.PostReplies,
          args: {
            targetContentId: content.data.contentId,
          },
        }}
        asList
      />
    </ScrollView>
  );
};
