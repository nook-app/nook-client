"use client";

import { NookText, View, XStack, YStack } from "@nook/ui";
import { Channel } from "@nook/common/types";
import { ZoomableImage } from "../../../components/zoomable-image";
import { CdnAvatar } from "../../../components/cdn-avatar";
import { FarcasterBioText } from "../../../components/farcaster/bio-text";
import { formatNumber } from "../../../utils";
import { FarcasterChannelKebabMenu } from "../../../components/farcaster/channels/channel-kebab-menu";

export const ChannelHeader = ({ channel }: { channel: Channel }) => {
  const bio = channel?.description?.trim().replace(/\n\s*\n/g, "\n");
  return (
    <YStack gap="$3" padding="$4">
      <View flexDirection="row" justifyContent="space-between">
        <XStack gap="$3" alignItems="center">
          <ZoomableImage uri={channel.imageUrl}>
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
        <FarcasterChannelKebabMenu channel={channel} />
      </View>
      <YStack gap="$3" $gtMd={{ display: "none" }}>
        {bio && <FarcasterBioText text={bio} />}
        <XStack alignItems="center" justifyContent="space-between">
          <View flexDirection="row" alignItems="center" gap="$1.5">
            <NookText fontWeight="600">
              {formatNumber(channel.followerCount || 0)}
            </NookText>
            <NookText muted>followers</NookText>
          </View>
          {channel.createdAt && (
            <View flexDirection="row" alignItems="center" gap="$1.5">
              <NookText muted>since</NookText>
              <NookText fontWeight="600">
                {new Date(channel.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </NookText>
            </View>
          )}
        </XStack>
      </YStack>
    </YStack>
  );
};
