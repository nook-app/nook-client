import { Channel, List } from "@nook/common/types";
import { NookButton, NookText, XStack, YStack } from "@nook/app-ui";
import { memo } from "react";
import { FarcasterBioText } from "../../components/farcaster/bio-text";
import { Link } from "../../components/link";
import { FarcasterChannelAvatar } from "../../components/farcaster/channels/channel-display";
import { ChannelFollowBadge } from "../../components/farcaster/channels/channel-follow-badge";
import { useAddChannelToList } from "../../hooks/useAddChannelToList";

export const ItemChannel = memo(
  ({ list, channel }: { list: List; channel: Channel }) => {
    const { addChannel, removeChannel, isAdded } = useAddChannelToList(
      list,
      channel,
    );
    const bio = channel.description?.trim().replace(/\n\s*\n/g, "\n");
    return (
      <Link href={`/users/${channel.channelId}`}>
        <XStack
          gap="$2.5"
          padding="$2.5"
          hoverStyle={{
            transform: "all 0.2s ease-in-out",
            backgroundColor: "$color2",
          }}
        >
          <FarcasterChannelAvatar channel={channel} size="$4" />
          <YStack flexShrink={1} gap="$1" flexGrow={1}>
            <XStack justifyContent="space-between">
              <YStack gap="$1">
                <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                  <NookText
                    fontWeight="700"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {channel.name}
                  </NookText>
                </XStack>
                <XStack gap="$1.5" alignItems="center" flexShrink={1}>
                  <NookText
                    muted
                    numberOfLines={1}
                    ellipsizeMode="middle"
                    flexShrink={1}
                  >
                    {`/${channel.channelId}`}
                  </NookText>
                  <ChannelFollowBadge channel={channel} />
                </XStack>
              </YStack>
              <NookButton
                onPress={isAdded ? removeChannel : addChannel}
                variant={isAdded ? "active-action" : "action"}
              >
                {isAdded ? "Remove" : "Add"}
              </NookButton>
            </XStack>
            {bio && <FarcasterBioText text={bio} numberOfLines={3} />}
          </YStack>
        </XStack>
      </Link>
    );
  },
);
