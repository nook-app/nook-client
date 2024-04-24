"use client";

import { NookText, Select, View, XStack, YStack } from "@nook/ui";
import { FarcasterUserDisplay } from "../../../components/farcaster/users/user-display";
import { FarcasterCastText } from "../../../components/farcaster/casts/cast-text";
import { Embeds } from "../../../components/embeds/Embed";
import { FarcasterCastEngagement } from "../../../components/farcaster/casts/cast-engagement";
import { FarcasterChannelBadge } from "../../../components/farcaster/channels/channel-display";
import { useCast, useCastReplies } from "../../../api/farcaster";
import {
  FarcasterCustomActionButton,
  FarcasterLikeActionButton,
  FarcasterRecastActionButton,
  FarcasterReplyActionButton,
  FarcasterShareButton,
} from "../../../components/farcaster/casts/cast-actions";
import { FarcasterCastDefaultDisplay } from "../../../components/farcaster/casts/cast-display";
import { Display } from "../../../types";
import { FarcasterInfiniteFeed } from "../cast-feed/infinite-feed";
import {
  BarChartBig,
  Check,
  ChevronDown,
  Clock,
  Rocket,
} from "@tamagui/lucide-icons";
import { useState } from "react";

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
  const [replySort, setReplySort] = useState<"best" | "top" | "new">("best");
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCastReplies(hash, replySort);

  const casts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <View>
      <FarcasterInfiniteFeed
        casts={casts}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        displayMode={Display.REPLIES}
        ListHeaderComponent={
          <FarcasterExpandedCastHeader
            hash={hash}
            onReplySortChange={setReplySort}
          />
        }
        isLoading={isLoading}
      />
    </View>
  );
};

const FarcasterExpandedCastHeader = ({
  hash,
  onReplySortChange,
}: {
  hash: string;
  onReplySortChange: (sort: "best" | "top" | "new") => void;
}) => {
  const { data: cast } = useCast(hash);
  if (!cast) return null;

  const renderText = cast.text || cast.mentions.length > 0;
  const renderEmbeds = cast.embeds.length > 0 || cast.embedCasts.length > 0;

  return (
    <View>
      {cast.ancestors?.toReversed().map((ancestor) => (
        <FarcasterCastDefaultDisplay cast={ancestor} isConnected />
      ))}
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
      <Select defaultValue="best" onValueChange={onReplySortChange}>
        <Select.Trigger
          borderWidth="$0"
          width="auto"
          alignSelf="flex-end"
          justifyContent="center"
          paddingHorizontal="$3"
          paddingVertical="$1"
          margin="$2"
          size="$2"
        >
          <XStack gap="$1.5" alignItems="center">
            <NookText muted fontSize="$4">
              Sorted by
            </NookText>
            <Select.Value color="$mauve12" />
            <ChevronDown size={16} />
          </XStack>
        </Select.Trigger>
        <Select.Content>
          <Select.ScrollUpButton />
          <Select.Viewport>
            <Select.Group>
              <Select.Item index={0} value="best">
                <XStack gap="$2" alignItems="center">
                  <Rocket size={16} />
                  <Select.ItemText>Best</Select.ItemText>
                </XStack>
                <Select.ItemIndicator marginLeft="auto">
                  <Check size={16} />
                </Select.ItemIndicator>
              </Select.Item>
              <Select.Item index={1} value="top">
                <XStack gap="$2" alignItems="center">
                  <BarChartBig size={16} />
                  <Select.ItemText>Top</Select.ItemText>
                </XStack>
                <Select.ItemIndicator marginLeft="auto">
                  <Check size={16} />
                </Select.ItemIndicator>
              </Select.Item>
              <Select.Item index={2} value="new">
                <XStack gap="$2" alignItems="center">
                  <Clock size={16} />
                  <Select.ItemText>New</Select.ItemText>
                </XStack>
                <Select.ItemIndicator marginLeft="auto">
                  <Check size={16} />
                </Select.ItemIndicator>
              </Select.Item>
            </Select.Group>
          </Select.Viewport>
          <Select.ScrollDownButton />
        </Select.Content>
      </Select>
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
