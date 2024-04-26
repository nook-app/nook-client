import { EmbedMedia } from "./EmbedMedia";
import { CdnAvatar } from "../cdn-avatar";
import { FarcasterUserTextDisplay } from "../farcaster/users/user-display";
import { NookText, View, XStack, YStack } from "@nook/ui";
import { FarcasterCastText } from "../farcaster/casts/cast-text";
import { FarcasterCast } from "../../types";
import { formatTimeAgo } from "../../utils";
import { useRouter } from "solito/navigation";

export const EmbedCast = ({
  cast,
}: {
  cast: FarcasterCast;
}) => {
  const { push } = useRouter();
  return (
    <View
      onPress={(e) => {
        e.preventDefault();
        e.stopPropagation();
        push(`/casts/${cast.hash}`);
      }}
      cursor="pointer"
      transition="all 0.2s ease-in-out"
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        backgroundColor: "$color2",
      }}
    >
      <YStack
        borderWidth="$0.5"
        borderColor="$borderColor"
        borderRadius="$4"
        padding="$2.5"
        gap="$1"
      >
        <XStack alignItems="center">
          <View marginRight="$2">
            <CdnAvatar src={cast.user.pfp} size="$1" />
          </View>
          <FarcasterUserTextDisplay user={cast.user} />
          <NookText muted>{` · ${formatTimeAgo(cast.timestamp)}`}</NookText>
        </XStack>
        {(cast.text || cast.mentions.length > 0) && (
          <FarcasterCastText cast={cast} disableLinks />
        )}
        {cast.embeds.length > 0 && <EmbedMedia cast={cast} />}
      </YStack>
    </View>
  );
};
