"use client";

import { NookText, View, XStack, YStack } from "@nook/ui";
import { Channel } from "../../../types";
import { ZoomableImage } from "../../../components/zoomable-image";
import { CdnAvatar } from "../../../components/cdn-avatar";
import { useChannel } from "../../../api/farcaster";

export const ChannelHeader = ({ channelId }: { channelId: string }) => {
  const { data: channel } = useChannel(channelId);
  if (!channel) return null;

  return (
    <YStack gap="$3" padding="$4">
      <View flexDirection="row" justifyContent="space-between">
        <XStack gap="$3" alignItems="center">
          <ZoomableImage aspectRatio={1} uri={channel.imageUrl}>
            <View cursor="pointer">
              <CdnAvatar src={channel.imageUrl} size="$6" />
            </View>
          </ZoomableImage>
          <YStack gap="$1">
            <NookText fontWeight="600" fontSize="$8">
              {channel.name}
            </NookText>
            <NookText muted>{`/${channel.channelId}`}</NookText>
          </YStack>
        </XStack>
      </View>
    </YStack>
  );
};
