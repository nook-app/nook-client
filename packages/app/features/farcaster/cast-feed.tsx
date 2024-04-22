import {
  FarcasterCast,
  FarcasterFeedFilter,
  UserFilterType,
} from "../../types";
import { NookText, Spinner, View, XStack, YStack } from "@nook/ui";
import { useCastFeed } from "../../api/farcaster";
import { CdnAvatar } from "../../components/cdn-avatar";
import { FarcasterCastText } from "../../components/farcaster/cast-text";
import { FarcasterUserTextDisplay } from "../../components/farcaster/user-display";
import { formatTimeAgo } from "../../utils";
import { FarcasterChannelDisplay } from "../../components/farcaster/channel-display";
import { Embeds } from "../../components/embeds/Embed";
import { Link } from "solito/link";
import { Loading } from "../../components/loading";
import { useRouter } from "solito/navigation";

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
  const renderEmbeds = cast.embeds.length > 0;
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
      padding="$3"
      transition="all 0.2s ease-in-out"
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        backgroundColor: "$color2",
      }}
      onPress={handlePress}
    >
      <YStack alignItems="center" width="$4" marginTop="$1">
        <View
          onPress={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Link href={`/${cast.user.username}`}>
            <CdnAvatar src={cast.user.pfp} size="$4" />
          </Link>
        </View>
      </YStack>
      <YStack flex={1} gap="$2">
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
        {renderText && <FarcasterCastText cast={cast} />}
        {renderEmbeds && <Embeds cast={cast} />}
      </YStack>
    </XStack>
  );
};
