import { NookText, View, YStack } from "@nook/app-ui";
import { FarcasterChannelFeedItem } from "../farcaster/channel-feed/channel-feed-item";
import { Channel } from "@nook/common/types";

export const RecommendedChannels = ({ channels }: { channels: Channel[] }) => {
  if (channels.length === 0) return null;

  return (
    <YStack
      borderRadius="$4"
      backgroundColor="$color1"
      borderColor="$borderColorBg"
      borderWidth="$0.5"
    >
      <View padding="$3">
        <NookText variant="label">Recommended Channels</NookText>
      </View>
      <YStack>
        {channels.slice(0, 5).map((channel: Channel) => (
          <FarcasterChannelFeedItem key={channel.channelId} channel={channel} />
        ))}
      </YStack>
    </YStack>
  );
};
