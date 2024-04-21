import { Text, View, XStack, YStack } from "tamagui";
import { FarcasterCastText } from "../farcaster/FarcasterCastText";
import { EmbedMedia } from "./EmbedMedia";
import { Link } from "solito/link";
import { CdnAvatar } from "../CdnAvatar";
import { FarcasterUserDisplay } from "../farcaster/FarcasterUserDisplay";
import { formatTimeAgo } from "../../utils";
import { FarcasterChannelDisplay } from "../farcaster/FarcasterChannelDisplay";
import { FarcasterCastResponse } from "@nook/common/types";

export const EmbedCast = ({
  cast,
}: {
  cast: FarcasterCastResponse;
}) => {
  return (
    <Link href={`/casts/${cast.hash}`}>
      <YStack
        borderWidth="$0.25"
        borderColor="$borderColor"
        borderRadius="$4"
        padding="$2.5"
        gap="$2"
      >
        <XStack gap="$2" alignItems="center">
          <CdnAvatar src={cast.user.pfp} size="$3" />
          <YStack flex={1} gap="$1">
            <FarcasterUserDisplay user={cast.user} />
            <XStack alignItems="center" gap="$1.5" flexShrink={1}>
              <Text color="$mauve12">{formatTimeAgo(cast.timestamp)}</Text>
              {cast.channel && (
                <>
                  <Text color="$mauve12">in</Text>
                  <View flexShrink={1}>
                    <FarcasterChannelDisplay channel={cast.channel} />
                  </View>
                </>
              )}
            </XStack>
          </YStack>
        </XStack>
        {(cast.text || cast.mentions.length > 0) && (
          <FarcasterCastText cast={cast} disableLinks />
        )}
        {cast.embeds.length > 0 && <EmbedMedia cast={cast} />}
      </YStack>
    </Link>
  );
};
