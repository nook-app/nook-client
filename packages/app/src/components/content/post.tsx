import { ContentFeedItem } from "@nook/api/types";
import { ContentType, PostData, TopicType } from "@nook/common/types";
import { ScrollView, Text, View, XStack, YStack } from "tamagui";
import { Embed } from "@/components/embeds";
import { EntityAvatar } from "@/components/entity/avatar";
import { PostContent, formatTipsAmount } from "@/components/utils";
import { EntityDisplay } from "../entity/display";
import { CHANNELS } from "@/constants";
import { Image } from "expo-image";
import { ContentFeedPanel } from "../panels/ContentFeedPanel";
import { useAppDispatch } from "@/store/hooks/useAppDispatch";
import { setActiveChannelModal } from "@/store/slices/user";
import { TouchableOpacity } from "react-native-gesture-handler";

export const ContentPost = ({
  item: { data, engagement, tips },
}: { item: ContentFeedItem<PostData> }) => {
  const dispatch = useAppDispatch();
  const degenTips =
    tips["chain://eip155:8453/erc20:0xc9034c3e7f58003e6ae0c8438e7c8f4598d5acaa"]
      ?.amount || 0;

  return (
    <ScrollView>
      <YStack
        padding="$2"
        gap="$3"
        borderBottomColor="$borderColor"
        borderBottomWidth="$0.5"
      >
        <XStack gap="$2">
          <EntityAvatar entityId={data.entityId.toString()} />
          <EntityDisplay
            entityId={data.entityId.toString()}
            orientation="vertical"
          />
        </XStack>
        <PostContent data={data} />
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
          {data.channelId && CHANNELS[data.channelId] && (
            <>
              <Text color="$gray11">{"·"}</Text>
              <TouchableOpacity
                onPress={() => dispatch(setActiveChannelModal(data.channelId))}
              >
                <View borderRadius="$10" overflow="hidden">
                  <Image
                    source={{ uri: CHANNELS[data.channelId]?.imageUrl }}
                    style={{ width: 16, height: 16 }}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => dispatch(setActiveChannelModal(data.channelId))}
              >
                <Text numberOfLines={1} ellipsizeMode="tail">
                  {CHANNELS[data.channelId].name}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </XStack>
        <XStack gap="$2">
          <View flexDirection="row" alignItems="center" gap="$1">
            <Text fontWeight="700">{engagement.replies}</Text>
            <Text color="$gray11">Replies</Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$1">
            <Text fontWeight="700">{engagement.reposts}</Text>
            <Text color="$gray11">Reposts</Text>
          </View>
          <View flexDirection="row" alignItems="center" gap="$1">
            <Text fontWeight="700">{engagement.likes}</Text>
            <Text color="$gray11">Likes</Text>
          </View>
          {degenTips > 0 && (
            <View flexDirection="row" alignItems="center" gap="$1">
              <Text fontWeight="700">{formatTipsAmount(degenTips)}</Text>
              <Text color="$gray11">$DEGEN</Text>
            </View>
          )}
        </XStack>
      </YStack>
      <ScrollView
        horizontal
        contentContainerStyle={{
          justifyContent: "center",
          width: "100%",
        }}
      >
        <ContentFeedPanel
          args={{
            filter: {
              type: ContentType.REPLY,
              deletedAt: null,
              topics: {
                type: TopicType.TARGET_CONTENT,
                value: data.contentId,
              },
            },
            sort: "engagement.likes",
          }}
        />
      </ScrollView>
    </ScrollView>
  );
};
