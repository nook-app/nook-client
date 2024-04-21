import { FarcasterCastResponse, FarcasterFeedFilter } from "@nook/common/types";
import { Spinner, View, XStack, YStack } from "@nook/ui";
import { FarcasterUserDisplay } from "../../components/farcaster/FarcasterUserDisplay";
import { useCastFeed } from "../../api/farcaster";
import { CdnAvatar } from "../../components/CdnAvatar";
import { FarcasterCastText } from "../../components/farcaster/FarcasterCastText";
import { Embeds } from "../../components/embeds/Embed";

export const FarcasterCastFeed = ({
  filter,
}: { filter: FarcasterFeedFilter }) => {
  const { data, isLoading } = useCastFeed(filter);

  if (isLoading) {
    return (
      <View width="$3" height="$3">
        <Spinner size="large" />
      </View>
    );
  }

  const casts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <YStack>
      {casts.map((cast) => (
        <FarcasterCast key={cast.hash} cast={cast} />
      ))}
    </YStack>
  );
};

const FarcasterCast = ({ cast }: { cast: FarcasterCastResponse }) => {
  const renderText = cast.text || cast.mentions.length > 0;
  const renderEmbeds = cast.embeds.length > 0;
  return (
    <XStack
      gap="$2"
      borderBottomWidth="$0.5"
      borderBottomColor="$color4"
      padding="$3"
    >
      <YStack alignItems="center" width="$4" marginTop="$1">
        <View>
          <CdnAvatar src={cast.user.pfp} size="$4" />
        </View>
      </YStack>
      <YStack flex={1}>
        <FarcasterUserDisplay user={cast.user} orientation="vertical" />
        {renderText && <FarcasterCastText cast={cast} />}
        {renderEmbeds && <Embeds cast={cast} />}
      </YStack>
    </XStack>
  );
};
