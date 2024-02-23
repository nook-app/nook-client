import { Content, PostData } from "@nook/common/types";
import { Separator, Text, View, XStack, YStack } from "tamagui";
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
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useContent } from "@/hooks/useContent";

export const ContentPostContent = ({
  content: { data, timestamp, engagement },
  isParent,
}: { content: Content<PostData>; isParent?: boolean }) => {
  const channel = useAppSelector((state) =>
    data.channelId ? selectChannelById(state, data.channelId) : undefined,
  );
  const parentContent = useContent(data.parentId);
  const showParentContext = isParent && parentContent;
  return (
    <XStack gap="$2">
      <View width="$3.5" alignItems="center">
        <EntityAvatar entityId={data.entityId} />
        {isParent && <Separator vertical />}
      </View>
      <YStack flex={1} gap="$1" paddingBottom={isParent ? "$2" : "$0"}>
        <EntityDisplay entityId={data.entityId} />
        <XStack alignItems="center" gap="$1.5">
          <Text color="$gray11">
            {`${formatTimeAgo(timestamp as unknown as string)} ago`}
          </Text>
          {showParentContext && data.parentEntityId && (
            <>
              <Text color="$gray11">replying to</Text>
              <EntityDisplay
                entityId={parentContent.data.entityId}
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
        {data.text && (
          <View paddingVertical="$1.5">
            <ContentPostText data={data} />
          </View>
        )}
        {data.embeds.map((embed) => (
          <Embed key={embed} embed={embed} data={data} />
        ))}
        <XStack justifyContent="space-between" width="$15">
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

export const ContentPostCompact = ({
  content,
}: { content: Content<PostData> }) => {
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
            contentId: content.contentId,
          })
        }
      >
        <ContentPostContent content={content} />
      </TouchableWithoutFeedback>
    </View>
  );
};
