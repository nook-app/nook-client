"use client";

import { NookText, View, XStack, YStack } from "@nook/ui";
import { FarcasterUserDisplay } from "../../../components/farcaster/users/user-display";
import { FarcasterCastText } from "../../../components/farcaster/casts/cast-text";
import { Embeds } from "../../../components/embeds/Embed";
import { FarcasterCastEngagement } from "../../../components/farcaster/casts/cast-engagement";
import { FarcasterChannelBadge } from "../../../components/farcaster/channels/channel-display";
import { useCast } from "../../../api/farcaster";
import {
  FarcasterCustomActionButton,
  FarcasterLikeActionButton,
  FarcasterRecastActionButton,
  FarcasterReplyActionButton,
  FarcasterShareButton,
} from "../../../components/farcaster/casts/cast-actions";
import { FarcasterReplyFeed } from "../cast-feed/reply-feed";

function formatTimestamp(timestamp: number) {
  const date = new Date(timestamp);
  // Format for time part
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });
  // Format for date part
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${timeFormatter.format(date)} · ${dateFormatter.format(date)}`;
}

export const FarcasterExpandedCast = ({ hash }: { hash: string }) => {
  const { data: cast } = useCast(hash);
  if (!cast) return null;

  const renderText = cast.text || cast.mentions.length > 0;
  const renderEmbeds = cast.embeds.length > 0 || cast.embedCasts.length > 0;

  return (
    <View>
      <YStack gap="$3" padding="$3">
        <FarcasterUserDisplay user={cast.user} asLink />
        {renderText && <FarcasterCastText cast={cast} fontSize="$6" />}
        {renderEmbeds && <Embeds cast={cast} />}
        <XStack justifyContent="space-between" alignItems="center">
          <FarcasterCastEngagement cast={cast} types={["likes", "replies"]} />
          <XStack alignItems="center" gap="$2">
            <NookText muted>{formatTimestamp(cast.timestamp)}</NookText>
            {cast.channel && (
              <FarcasterChannelBadge channel={cast.channel} asLink />
            )}
          </XStack>
        </XStack>
      </YStack>
      <FarcasterCastActions hash={cast.hash} />
      <FarcasterReplyFeed hash={cast.hash} />
    </View>
  );
};

export const FarcasterCastActions = ({ hash }: { hash: string }) => {
  const { data: cast } = useCast(hash);

  return (
    <XStack
      alignItems="center"
      justifyContent="space-around"
      borderTopWidth="$0.5"
      borderTopColor="rgba(256, 256, 256, 0.1)"
      borderBottomWidth="$0.5"
      borderBottomColor="rgba(256, 256, 256, 0.1)"
      paddingVertical="$2"
    >
      <FarcasterReplyActionButton />
      <FarcasterRecastActionButton />
      <FarcasterLikeActionButton />
      <FarcasterCustomActionButton />
      <FarcasterShareButton />
    </XStack>
  );
};
