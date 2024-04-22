import { EmbedMedia } from "./EmbedMedia";
import { Link } from "solito/link";
import { CdnAvatar } from "../cdn-avatar";
import { FarcasterUserTextDisplay } from "../farcaster/user-display";
import { NookText, XStack, YStack } from "@nook/ui";
import { FarcasterChannelDisplay } from "../farcaster/channel-display";
import { FarcasterCastText } from "../farcaster/cast-text";
import { FarcasterCast } from "../../types";
import { formatTimeAgo } from "../../utils";

export const EmbedCast = ({
  cast,
}: {
  cast: FarcasterCast;
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
            <YStack gap="$1">
              <FarcasterUserTextDisplay user={cast.user} />
              <XStack alignItems="center" gap="$1.5">
                <NookText muted>{formatTimeAgo(cast.timestamp)}</NookText>
                {cast.channel && (
                  <>
                    <NookText muted>in</NookText>
                    <FarcasterChannelDisplay channel={cast.channel} />
                  </>
                )}
              </XStack>
            </YStack>
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
