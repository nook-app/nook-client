import { Content, PostData } from "@nook/common/types";
import { Separator, Text, View, XStack, YStack, useTheme } from "tamagui";
import { Embed } from "@/components/embeds/Embed";
import { EntityAvatar } from "@/components/entity/EntityAvatar";
import { ContentPostText } from "@/components/content/ContentPostText";
import { EntityDisplay } from "../entity/EntityDisplay";
import { Image } from "expo-image";
import { Heart, MessageSquare, RefreshCw } from "@tamagui/lucide-icons";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectChannelById } from "@/store/slices/channel";
import { ChannelModalButton } from "../buttons/ChannelModalButton";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useContent } from "@/hooks/useContent";
import { formatNumber, formatTimeAgo } from "@/utils";

export const ContentPostContent = ({
  contentId,
  isParent,
}: { contentId: string; isParent?: boolean }) => {
  const theme = useTheme();
  const contentData = useContent(contentId);
  if (!contentData) return null;
  const { content, context } = contentData;
  const channel = useAppSelector((state) =>
    content.data.channelId
      ? selectChannelById(state, content.data.channelId)
      : undefined,
  );
  const parentContent = useContent(content.data.parentId);
  const showParentContext = isParent && parentContent;
  return (
    <XStack gap="$2">
      <View width="$3.5" alignItems="center">
        <EntityAvatar entityId={content.data.entityId} />
        {isParent && <Separator vertical />}
      </View>
      <YStack flex={1} gap="$1" paddingBottom={isParent ? "$2" : "$0"}>
        <View alignSelf="flex-start">
          <EntityDisplay entityId={content.data.entityId} />
        </View>
        <XStack alignItems="center" gap="$1.5">
          <Text color="$gray11">
            {formatTimeAgo(content.timestamp as unknown as string)}
          </Text>
          {showParentContext && content.data.parentEntityId && (
            <>
              <Text color="$gray11">replying to</Text>
              <EntityDisplay
                entityId={parentContent.content.data.entityId}
                hideDisplayName
              />
            </>
          )}
          {channel && !showParentContext && (
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
        {content.data.text && (
          <View paddingVertical="$1.5">
            <ContentPostText data={content.data} />
          </View>
        )}
        {content.data.embeds.map((embed) => (
          <Embed key={embed} embed={embed} data={content.data} />
        ))}
        <XStack justifyContent="space-between" width="$15" paddingTop="$1">
          <View flexDirection="row" alignItems="center" gap="$1.5" width="$3">
            <MessageSquare size={16} color="$gray10" />
            <Text color="$gray10" fontSize="$4">
              {formatNumber(content.engagement.replies)}
            </Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$1.5" width="$3">
            <RefreshCw
              size={16}
              color={context.reposted ? "$green9" : "$gray10"}
              fill={
                context.reposted ? theme.$green9.val : theme.$background.val
              }
            />
            <Text color="$gray10" fontSize="$4">
              {formatNumber(content.engagement.reposts)}
            </Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$1.5" width="$3">
            <Heart
              size={16}
              color={context.liked ? "$red9" : "$gray10"}
              fill={context.liked ? theme.$red9.val : theme.$background.val}
            />
            <Text color="$gray10" fontSize="$4">
              {formatNumber(content.engagement.likes)}
            </Text>
          </View>
        </XStack>
      </YStack>
    </XStack>
  );
};

export const ContentPostCompact = ({ contentId }: { contentId: string }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <View
      borderBottomWidth="$0.25"
      borderBottomColor="$borderColor"
      padding="$2"
    >
      <TouchableWithoutFeedback
        onPress={() =>
          navigation.navigate("Content", {
            contentId,
          })
        }
      >
        <ContentPostContent contentId={contentId} />
      </TouchableWithoutFeedback>
    </View>
  );
};
