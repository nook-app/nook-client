import { Display, FarcasterCast } from "../../../types";
import { NookText, Separator, View, XStack, YStack } from "@nook/ui";
import { useCast } from "../../../api/farcaster";
import { FarcasterCastText } from "../../../components/farcaster/casts/cast-text";
import {
  FarcasterUserAvatar,
  FarcasterUserDisplay,
  FarcasterUserTextDisplay,
} from "../../../components/farcaster/users/user-display";
import { formatTimeAgo } from "../../../utils";
import { FarcasterChannelBadge } from "../../../components/farcaster/channels/channel-display";
import { Embeds } from "../../../components/embeds/Embed";
import { useRouter } from "solito/navigation";
import { FarcasterCastEngagement } from "../../../components/farcaster/casts/cast-engagement";
import {
  FarcasterCustomActionButton,
  FarcasterLikeActionButton,
  FarcasterRecastActionButton,
  FarcasterReplyActionButton,
  FarcasterShareButton,
} from "../../../components/farcaster/casts/cast-actions";
import { Link } from "solito/link";

export const FarcasterCastDisplay = ({
  cast,
  displayMode,
}: { cast: FarcasterCast; displayMode: Display }) => {
  switch (displayMode) {
    case Display.MEDIA:
      return <FarcasterCastMediaDisplay cast={cast} />;
    case Display.GRID:
      return <FarcasterCastGridDisplay cast={cast} />;
    default:
      if (cast.parent && displayMode !== Display.REPLIES) {
        return (
          <View
            borderBottomWidth="$0.5"
            borderBottomColor="rgba(256, 256, 256, 0.1)"
          >
            <FarcasterCastDefaultDisplay cast={cast.parent} isConnected />
            <FarcasterCastDefaultDisplay cast={cast} />
          </View>
        );
      }
      return (
        <View
          borderBottomWidth="$0.5"
          borderBottomColor="rgba(256, 256, 256, 0.1)"
        >
          <FarcasterCastDefaultDisplay cast={cast} />
        </View>
      );
  }
};

const FarcasterCastGridDisplay = ({ cast }: { cast: FarcasterCast }) => {
  const imageEmbed = cast.embeds.find((embed) =>
    embed.type?.startsWith("image"),
  );

  if (!imageEmbed) {
    return null;
  }

  return (
    <Link href={`/casts/${cast.hash}`}>
      <View
        borderRightWidth="$0.5"
        borderBottomWidth="$0.5"
        borderColor="rgba(256, 256, 256, 0.1)"
      >
        <img
          src={imageEmbed.uri}
          alt=""
          style={{ objectFit: "cover", aspectRatio: 1 }}
        />
      </View>
    </Link>
  );
};

const FarcasterCastMediaDisplay = ({ cast }: { cast: FarcasterCast }) => {
  const imageEmbed = cast.embeds.find((embed) =>
    embed.type?.startsWith("image"),
  );

  if (!imageEmbed) {
    return null;
  }

  return (
    <YStack
      gap="$2.5"
      borderBottomWidth="$0.25"
      borderBottomColor="$color4"
      paddingVertical="$2"
    >
      <FarcasterUserDisplay user={cast.user} />
      <img src={imageEmbed.uri} alt="" />
      <YStack paddingHorizontal="$2.5" gap="$2">
        <NookText numberOfLines={4}>
          <NookText fontWeight="600" color="$mauve12">
            {cast.user.username || `!${cast.user.fid}`}{" "}
          </NookText>
          {(cast.text || cast.mentions.length > 0) && (
            <FarcasterCastText cast={cast} />
          )}
        </NookText>
        <FarcasterCastActions hash={cast.hash} />
      </YStack>
    </YStack>
  );
};

export const FarcasterCastDefaultDisplay = ({
  cast,
  isConnected,
}: { cast: FarcasterCast; isConnected?: boolean }) => {
  const { push } = useRouter();

  const handlePress = () => {
    const selection = window?.getSelection()?.toString();
    if (!selection || selection.length === 0) {
      push(`/casts/${cast.hash}`);
    }
  };

  const renderText = cast.text || cast.mentions.length > 0;
  const renderEmbeds = cast.embeds.length > 0 || cast.embedCasts.length > 0;
  const renderEngagementBar =
    !!cast.channel ||
    Object.values(cast.engagement || {}).some((value) => value > 0);

  return (
    <XStack
      gap="$2"
      transition="all 0.2s ease-in-out"
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        backgroundColor: "$color2",
      }}
      onPress={handlePress}
      cursor="pointer"
      paddingHorizontal="$3"
      paddingVertical="$3"
    >
      <YStack alignItems="center" width="$4" marginTop="$1">
        <FarcasterUserAvatar user={cast.user} size="$4" asLink />
        {isConnected && (
          <Separator
            vertical
            marginBottom="$-4"
            borderWidth="$0.5"
            borderColor="rgba(256, 256, 256, 0.1)"
            zIndex={1}
          />
        )}
      </YStack>
      <YStack flex={1} gap="$2">
        <YStack gap="$1">
          <XStack alignItems="center">
            <FarcasterUserTextDisplay user={cast.user} asLink />
            <NookText muted>{` · ${formatTimeAgo(cast.timestamp)}`}</NookText>
          </XStack>
          {renderText && <FarcasterCastText cast={cast} />}
        </YStack>
        {renderEmbeds && <Embeds cast={cast} />}
        <FarcasterCastActions hash={cast.hash} />
        {renderEngagementBar && (
          <XStack justifyContent="space-between" alignItems="center">
            <FarcasterCastEngagement cast={cast} types={["likes", "replies"]} />
            <View>
              {cast.channel && (
                <FarcasterChannelBadge channel={cast.channel} asLink />
              )}
            </View>
          </XStack>
        )}
      </YStack>
    </XStack>
  );
};

export const FarcasterCastActions = ({ hash }: { hash: string }) => {
  const { data: cast } = useCast(hash);

  return (
    <XStack alignItems="center" justifyContent="space-between" marginLeft="$-2">
      <XStack gap="$2" alignItems="center">
        <FarcasterReplyActionButton />
        <FarcasterRecastActionButton />
        <FarcasterLikeActionButton />
      </XStack>
      <XStack gap="$2" alignItems="center">
        <FarcasterCustomActionButton />
        <FarcasterShareButton />
      </XStack>
    </XStack>
  );
};
