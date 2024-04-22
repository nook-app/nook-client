import { NookText, View, XStack } from "@nook/ui";
import { Channel } from "../../types";
import { Link } from "solito/link";
import { CdnAvatar } from "../cdn-avatar";

export const FarcasterChannelDisplay = ({ channel }: { channel: Channel }) => {
  return (
    <Link href={`/channels/${channel.channelId}`}>
      <XStack gap="$1.5" alignItems="center" flexShrink={1}>
        <CdnAvatar src={channel.imageUrl} size="$0.9" />
        <View flexShrink={1}>
          <NookText numberOfLines={1} ellipsizeMode="tail">
            {channel.name}
          </NookText>
        </View>
      </XStack>
    </Link>
  );
};
