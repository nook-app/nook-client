import { Channel } from "@nook/common/types";
import { XStack, YStack } from "@nook/app-ui";
import { memo } from "react";
import { FarcasterChannelDisplay } from "../../../components/farcaster/channels/channel-display";
import { FarcasterChannelTooltip } from "../../../components/farcaster/channels/channel-tooltip";
import { Link } from "../../../components/link";

export const FarcasterChannelFeedItem = memo(
  ({ channel, withBio }: { channel: Channel; withBio?: boolean }) => {
    return (
      <FarcasterChannelTooltip channel={channel}>
        <Link href={`/channels/${channel.channelId}`}>
          <YStack
            gap="$2"
            paddingHorizontal="$3.5"
            paddingVertical="$3"
            hoverStyle={{
              transform: "all 0.2s ease-in-out",
              backgroundColor: "$color2",
            }}
          >
            <XStack justifyContent="space-between">
              <FarcasterChannelDisplay channel={channel} withBio={withBio} />
            </XStack>
          </YStack>
        </Link>
      </FarcasterChannelTooltip>
    );
  },
);
