import { NookText, View, XStack, YStack } from "@nook/ui";
import { Channel } from "../../../types";
import { FarcasterBioText } from "../../../components/farcaster/bio-text";
import { formatNumber } from "../../../utils";
import { FarcasterChannelDisplay } from "./channel-display";

export const ChannelOverview = ({
  channel,
  asLink,
}: { channel: Channel; asLink?: boolean }) => {
  const bio = channel?.description?.trim().replace(/\n\s*\n/g, "\n");

  return (
    <YStack
      padding="$3"
      gap="$3"
      borderRadius="$4"
      backgroundColor="$color2"
      borderColor="$color4"
      borderWidth="$0.5"
    >
      <FarcasterChannelDisplay channel={channel} asLink={asLink} />
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
  );
};
