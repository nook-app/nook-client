"use client";

import {
  NookButton,
  NookText,
  Popover,
  View,
  XStack,
  YStack,
} from "@nook/app-ui";
import { Channel } from "@nook/common/types";
import { ZoomableImage } from "../../../components/zoomable-image";
import { CdnAvatar } from "../../../components/cdn-avatar";
import { FarcasterBioText } from "../../../components/farcaster/bio-text";
import { formatNumber } from "../../../utils";
import { FarcasterChannelMenu } from "../../../components/farcaster/channels/channel-menu";
import { MoreHorizontal } from "@tamagui/lucide-icons";
import { ChannelFollowBadge } from "../../../components/farcaster/channels/channel-follow-badge";
import { useUsers } from "../../../api/farcaster";
import { Link } from "../../../components/link";
import { memo } from "react";

export const ChannelHeader = ({
  channel,
  disableMenu,
}: { channel: Channel; disableMenu?: boolean }) => {
  const bio = channel?.description?.trim().replace(/\n\s*\n/g, "\n");
  return (
    <YStack gap="$3" padding="$2.5">
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
        {!disableMenu && (
          <FarcasterChannelMenu
            channel={channel}
            trigger={
              <Popover.Trigger asChild>
                <NookButton
                  variant="active-action"
                  width="$3"
                  height="$3"
                  padding="$0"
                >
                  <MoreHorizontal size={20} />
                </NookButton>
              </Popover.Trigger>
            }
          />
        )}
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

export const ChannelHeaderV2 = memo(
  ({
    channel,
    size,
    disableMenu,
  }: { channel: Channel; size?: string; disableMenu?: boolean }) => {
    const bio = channel?.description?.trim().replace(/\n\s*\n/g, "\n");
    return (
      <YStack gap="$3" padding="$2.5">
        <YStack gap="$2">
          <XStack justifyContent="space-between" gap="$2">
            <ZoomableImage uri={channel.imageUrl}>
              <View cursor="pointer">
                <CdnAvatar src={channel.imageUrl} size={size || "$10"} />
              </View>
            </ZoomableImage>
            <XStack gap="$2">
              {!disableMenu && (
                <FarcasterChannelMenu
                  channel={channel}
                  trigger={
                    <Popover.Trigger asChild>
                      <NookButton
                        variant="active-action"
                        width="$3"
                        height="$3"
                        padding="$0"
                      >
                        <MoreHorizontal size={20} color="$mauve12" />
                      </NookButton>
                    </Popover.Trigger>
                  }
                />
              )}
            </XStack>
          </XStack>
          <YStack gap="$1">
            <XStack gap="$1.5" alignItems="center">
              <NookText fontWeight="700" fontSize="$6">
                {channel.name}
              </NookText>
            </XStack>
            <XStack gap="$2" alignItems="center">
              <NookText muted>{`/${channel.channelId}`}</NookText>
              <ChannelFollowBadge channel={channel} />
            </XStack>
          </YStack>
        </YStack>
        {bio && <FarcasterBioText text={bio} selectable />}
        <XStack gap="$2">
          <View flexDirection="row" alignItems="center" gap="$1">
            <NookText fontWeight="600">
              {formatNumber(channel.followerCount || 0)}
            </NookText>
            <NookText muted>followers</NookText>
          </View>
          <View flexDirection="row" alignItems="center" gap="$1">
            <NookText fontWeight="600">
              {new Date(channel.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </NookText>
            <NookText muted>created</NookText>
          </View>
        </XStack>
        <HostsPreview channel={channel} />
      </YStack>
    );
  },
);

const HostsPreview = ({ channel }: { channel: Channel }) => {
  const fids = [];
  if (channel.creatorId) {
    fids.push(channel.creatorId);
  }
  if (channel.hostFids) {
    fids.push(...channel.hostFids);
  }

  const { data } = useUsers(Array.from(new Set(fids)).sort());

  const total = data?.data.length || 0;
  const previews = data?.data.slice(0, 3) || [];
  const other = total - previews.length;

  let label = "Not followed by anyone you’re following";

  switch (previews.length) {
    case 3:
      if (other > 0) {
        label = `Hosted by ${
          previews[0].displayName || previews[0].username
        }, ${
          previews[1].displayName || previews[1].username
        }, and ${other} other${other > 1 ? "s" : ""}`;
      } else {
        label = `Hosted by ${
          previews[0].displayName || previews[0].username
        }, ${previews[1].displayName || previews[1].username}, and ${
          previews[2].displayName || previews[2].username
        }`;
      }
      break;
    case 2:
      label = `Hosted by ${
        previews[0].displayName || previews[0].username
      } and ${previews[1].displayName || previews[1].username}`;
      break;
    case 1:
      label = `Hosted by ${previews[0].displayName || previews[0].username}`;
  }

  if (total === 0) {
    return null;
  }

  return (
    <Link href={`/channels/${channel.channelId}/hosts`} unpressable>
      <XStack gap="$3" alignItems="center" cursor="pointer" group>
        {previews.length > 0 && (
          <XStack>
            {previews.map((user) => (
              <View key={user.fid} marginRight="$-2">
                <CdnAvatar src={user.pfp} size="$1" />
              </View>
            ))}
          </XStack>
        )}
        {/* @ts-ignore */}
        <NookText
          muted
          fontSize="$3"
          $group-hover={{
            textDecoration: "underline",
          }}
          numberOfLines={1}
          flexShrink={1}
        >
          {label}
        </NookText>
      </XStack>
    </Link>
  );
};
