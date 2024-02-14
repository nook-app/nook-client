import { ContentFeedItem } from "@flink/api/types";
import { PostData } from "@flink/common/types";
import { ScrollView, Text, View, XStack, YStack } from "tamagui";
import { Embed } from "@/components/embeds";
import { ContentReplies } from "@/components/feed";
import { EntityAvatar } from "@/components/entity/avatar";
import { PostContent, formatTipsAmount } from "@/components/utils";
import { EntityDisplay } from "../entity/display";
import { CHANNELS } from "@/constants";

export const ContentPost = ({
  item: { data, entityMap, contentMap },
}: { item: ContentFeedItem<PostData> }) => {
  const engagement = contentMap[data.contentId].engagement;
  const tips = contentMap[data.contentId].tips;
  const entity = entityMap[data.entityId.toString()];

  return (
    <ScrollView>
      <YStack
        padding="$2"
        gap="$3"
        borderBottomColor="$borderColor"
        borderBottomWidth="$0.5"
      >
        <XStack gap="$2">
          <EntityAvatar entity={entity} />
          <EntityDisplay entity={entity} orientation="vertical" />
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
        <Text color="$gray11">
          {new Date(data.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
          {" · "}
          {new Date(data.timestamp).toLocaleDateString()}
        </Text>
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
          <View flexDirection="row" alignItems="center" gap="$1">
            <Text fontWeight="700">
              {formatTipsAmount(
                tips
                  ? tips[
                      "chain://eip155:8453/erc20:0xc9034c3e7f58003e6ae0c8438e7c8f4598d5acaa"
                    ]?.amount || 0
                  : 0,
              )}
            </Text>
            <Text color="$gray11">$DEGEN</Text>
          </View>
          <View
            flexDirection="row"
            alignItems="center"
            justifyContent="flex-end"
            gap="$1.5"
            flex={1}
          >
            {data.channelId && (
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
      <ContentReplies contentId={data.contentId} />
    </ScrollView>
  );
};
