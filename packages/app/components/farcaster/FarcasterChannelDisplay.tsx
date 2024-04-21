import { Text, View, XStack } from "@nook/ui";
import { Channel } from "../../types";
import { Link } from "solito/link";
import { CdnAvatar } from "../CdnAvatar";

export const FarcasterChannelDisplay = ({ channel }: { channel: Channel }) => {
  return (
    <Link href={`/channels/${channel.channelId}`}>
      <XStack gap="$1.5" alignItems="center" flexShrink={1}>
        <CdnAvatar src={channel.imageUrl} size="$1" />
        <View flexShrink={1}>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            fontWeight="500"
            color="$mauve12"
          >
            {channel.name}
          </Text>
        </View>
      </XStack>
    </Link>
  );
};
