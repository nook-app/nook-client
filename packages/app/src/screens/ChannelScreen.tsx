import { Avatar, Text, XStack, YStack } from "tamagui";
import {
  ChannelFilterType,
  ContentType,
  NookPanelType,
  TopicType,
} from "@nook/common/types";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { RootStackParamList } from "@/types";
import { Panels } from "@/components/panels/Panels";
import { useChannel } from "@/hooks/useChannel";
import { useEffect } from "react";

const ChannelHeader = () => {
  const {
    params: { channelId },
  } = useRoute<RouteProp<RootStackParamList, "Channel">>();
  const { channel } = useChannel(channelId);

  return (
    <YStack gap="$4" backgroundColor="$background" padding="$3">
      <XStack gap="$2" alignItems="center">
        <Avatar circular size="$3.5">
          <Avatar.Image src={channel.imageUrl} />
          <Avatar.Fallback backgroundColor="$backgroundPress" />
        </Avatar>
        <YStack>
          <Text fontWeight="700" fontSize="$5">
            {channel.name}
          </Text>
          <Text color="$gray11" fontSize="$4">
            {`/${channel.slug}`}
          </Text>
        </YStack>
      </XStack>
      {channel.description && <Text>{channel.description}</Text>}
    </YStack>
  );
};

export const ChannelScreen = () => {
  const {
    params: { channelId },
  } = useRoute<RouteProp<RootStackParamList, "Channel">>();
  const { channel } = useChannel(channelId);
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: channel.name || "",
    });
  }, [channel, navigation]);

  return (
    <Panels
      renderHeader={ChannelHeader}
      panels={[
        {
          name: "New",
          slug: "new",
          data: {
            type: NookPanelType.ChannelPosts,
            args: {
              channelFilter: {
                type: ChannelFilterType.Channels,
                args: {
                  channelIds: [channelId],
                },
              },
              contentTypes: [ContentType.POST],
            },
          },
        },
        {
          name: "Top",
          slug: "top",
          data: {
            type: NookPanelType.ChannelPosts,
            args: {
              channelFilter: {
                type: ChannelFilterType.Channels,
                args: {
                  channelIds: [channelId],
                },
              },
              contentTypes: [ContentType.POST, ContentType.REPLY],
              sort: "top",
            },
          },
        },
      ]}
    />
  );
};
