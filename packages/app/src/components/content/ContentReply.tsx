import { ContentFeedItem } from "@nook/api/types";
import { Content, ContentType, PostData } from "@nook/common/types";
import { ScrollView, Text, View, XStack, YStack } from "tamagui";
import { Embed } from "@/components/embeds/Embed";
import { EntityAvatar } from "@/components/entity/EntityAvatar";
import { EntityDisplay } from "../entity/EntityDisplay";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { Image } from "expo-image";
import { ContentFeedPanel } from "../panels/ContentFeedPanel";
import { useAppSelector } from "@/hooks/useAppSelector";
import { selectChannelById } from "@/store/slices/channel";
import { ContentPostText } from "./ContentPostText";
import { ChannelModalButton } from "../buttons/ChannelModalButton";
import { ContentPostContent } from "./ContentPostCompact";
import { useContent } from "@/hooks/useContent";
import { RootStackParamList } from "@/types";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { useEffect, useRef } from "react";
import { ScrollView as RNScrollView, View as RNView } from "react-native";

export const ContentReply = ({
  item: { data, engagement },
}: { item: ContentFeedItem<PostData> }) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const channel = useAppSelector((state) =>
    data.channelId ? selectChannelById(state, data.channelId) : undefined,
  );
  const parentContent = useContent(data.parentId);
  const scrollViewRef = useRef<RNScrollView>(null);
  const scrollTargetRef = useRef<RNView>(null);

  useEffect(() => {
    if (scrollViewRef.current && scrollTargetRef.current) {
      setTimeout(() => {
        scrollTargetRef.current?.measureLayout(
          // @ts-ignore
          scrollViewRef.current,
          (left, top, width, height) => {
            scrollViewRef.current?.scrollTo({
              y: top,
              animated: true,
            });
          },
          (error: Error) => {
            console.error(error);
          },
        );
      }, 300);
    }
  }, []);

  return (
    <ScrollView ref={scrollViewRef}>
      <View padding="$2">
        <TouchableWithoutFeedback
          onPress={() =>
            navigation.navigate("Content", {
              contentId: parentContent.contentId,
            })
          }
        >
          <ContentPostContent
            content={parentContent as Content<PostData>}
            isParent
          />
        </TouchableWithoutFeedback>
        <YStack
          ref={scrollTargetRef}
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
          <XStack gap="$2" paddingBottom="$2">
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
          </XStack>
        </YStack>
      </View>
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
