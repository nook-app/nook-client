import { Channel } from "@nook/common/types";
import { XStack, YStack } from "@nook/app-ui";
import { memo } from "react";
import { Link } from "solito/link";
import {
  FarcasterChannelDisplay,
  FarcasterChannelTooltip,
} from "../../../components/farcaster/channels/channel-display";

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
