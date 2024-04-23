import {
  FarcasterCast,
  FarcasterFeedFilter,
  UserFilterType,
} from "../../types";
import { NookText, Spinner, View, XStack, YStack } from "@nook/ui";
import { useCastFeed } from "../../api/farcaster";
import { CdnAvatar } from "../../components/cdn-avatar";
import { FarcasterCastText } from "../../components/farcaster/cast-text";
import {
  FarcasterUserAvatar,
  FarcasterUserTextDisplay,
} from "../../components/farcaster/user-display";
import { formatTimeAgo } from "../../utils";
import { FarcasterChannelBadge } from "../../components/farcaster/channel-display";
import { Embeds } from "../../components/embeds/Embed";
import { Link } from "solito/link";
import { Loading } from "../../components/loading";
import { useRouter } from "solito/navigation";
import { FarcasterCastEngagement } from "../../components/farcaster/cast-engagement";
import { FarcasterCastActions } from "../../components/farcaster/cast-actions";

export const FarcasterCastFeed = ({
  filter,
}: { filter: FarcasterFeedFilter }) => {
  const { data, isLoading } = useCastFeed(filter);

  if (isLoading) {
    return <Loading />;
  }

  const casts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <YStack>
      {casts.map((cast) => (
        <FarcasterCastFeedItem key={cast.hash} cast={cast} />
      ))}
    </YStack>
  );
};

const FarcasterCastFeedItem = ({ cast }: { cast: FarcasterCast }) => {
  const renderText = cast.text || cast.mentions.length > 0;
  const renderEmbeds = cast.embeds.length > 0 || cast.embedCasts.length > 0;
  const { push } = useRouter();

  const handlePress = () => {
    const selection = window?.getSelection()?.toString();
    if (!selection || selection.length === 0) {
      push(`/casts/${cast.hash}`);
    }
  };

  return (
    <XStack
      gap="$2"
      borderBottomWidth="$0.5"
      borderBottomColor="$color4"
      paddingHorizontal="$3"
      paddingVertical="$2"
      transition="all 0.2s ease-in-out"
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        backgroundColor: "$color2",
      }}
      onPress={handlePress}
      cursor="pointer"
    >
      <YStack alignItems="center" width="$4" marginTop="$1">
        <FarcasterUserAvatar user={cast.user} size="$4" asLink />
      </YStack>
      <YStack flex={1} gap="$2">
        <YStack gap="$1">
          <XStack alignItems="center">
            <FarcasterUserTextDisplay user={cast.user} />
            <NookText muted>{` · ${formatTimeAgo(cast.timestamp)}`}</NookText>
          </XStack>
          {renderText && <FarcasterCastText cast={cast} />}
        </YStack>
        {renderEmbeds && <Embeds cast={cast} />}
        <FarcasterCastActions hash={cast.hash} />
        <XStack justifyContent="space-between" alignItems="center">
          <FarcasterCastEngagement
            hash={cast.hash}
            types={["likes", "replies"]}
          />
          <View>
            {cast.channel && (
              <FarcasterChannelBadge channel={cast.channel} asLink />
            )}
          </View>
        </XStack>
      </YStack>
    </XStack>
  );
};
