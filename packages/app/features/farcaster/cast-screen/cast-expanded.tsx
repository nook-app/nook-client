"use client";

import { NookText, View, XStack, YStack, ToggleGroup, Tooltip } from "@nook/ui";
import { FarcasterUserDisplay } from "../../../components/farcaster/users/user-display";
import { FarcasterCastText } from "../../../components/farcaster/casts/cast-text";
import { Embeds } from "../../../components/embeds/Embed";
import { FarcasterCastEngagement } from "../../../components/farcaster/casts/cast-engagement";
import { FarcasterChannelBadge } from "../../../components/farcaster/channels/channel-display";
import { useCastReplies } from "../../../api/farcaster";
import {
  FarcasterCustomActionButton,
  FarcasterLikeActionButton,
  FarcasterRecastActionButton,
  FarcasterReplyActionButton,
  FarcasterShareButton,
} from "../../../components/farcaster/casts/cast-actions";
import { FarcasterCastDefaultDisplay } from "../../../components/farcaster/casts/cast-display";
import { Display, FarcasterCast } from "../../../types";
import { FarcasterInfiniteFeed } from "../cast-feed/infinite-feed";
import { BarChartBig, Clock, Rocket } from "@tamagui/lucide-icons";
import { useState } from "react";
import { FarcasterCastKebabMenu } from "../../../components/farcaster/casts/cast-kebab-menu";

function formatTimestampTime(timestamp: number) {
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const date = new Date(timestamp);
  return timeFormatter.format(date);
}

function formatTimestampDate(timestamp: number) {
  const date = new Date(timestamp);
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return dateFormatter.format(date);
}

export const FarcasterExpandedCast = ({ cast }: { cast: FarcasterCast }) => {
  const [replySort, setReplySort] = useState<"best" | "top" | "new">("best");
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCastReplies(cast.hash, replySort);

  const casts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <View>
      <FarcasterInfiniteFeed
        queryKey={["castReplies", cast.hash, replySort]}
        casts={casts}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        displayMode={Display.REPLIES}
        ListHeaderComponent={
          <FarcasterExpandedCastHeader
            cast={cast}
            replySort={replySort}
            onReplySortChange={setReplySort}
          />
        }
        isLoading={isLoading}
      />
    </View>
  );
};

const FarcasterExpandedCastHeader = ({
  cast,
  replySort,
  onReplySortChange,
}: {
  cast: FarcasterCast;
  replySort: "best" | "top" | "new";
  onReplySortChange: (sort: "best" | "top" | "new") => void;
}) => {
  const [likes, setLikes] = useState(cast.engagement.likes);
  const [recasts, setRecasts] = useState(cast.engagement.recasts);
  const renderText = cast.text || cast.mentions.length > 0;
  const renderEmbeds = cast.embeds.length > 0 || cast.embedCasts.length > 0;

  return (
    <View>
      {cast.ancestors?.toReversed().map((ancestor) => (
        <FarcasterCastDefaultDisplay
          key={ancestor.hash}
          cast={ancestor}
          isConnected
        />
      ))}
      <YStack gap="$3" padding="$3">
        <XStack justifyContent="space-between">
          <FarcasterUserDisplay user={cast.user} asLink />
          <FarcasterCastKebabMenu cast={cast} />
        </XStack>
        {renderText && <FarcasterCastText cast={cast} fontSize="$6" />}
        {renderEmbeds && <Embeds cast={cast} />}
        <XStack justifyContent="space-between" alignItems="center">
          <FarcasterCastEngagement
            hash={cast.hash}
            engagement={{ ...cast.engagement, likes, recasts }}
            types={["likes", "replies", "quotes", "recasts"]}
          />
          <XStack alignItems="center" gap="$2">
            <NookText muted $xs={{ display: "none" }}>
              {formatTimestampTime(cast.timestamp)}
            </NookText>
            <NookText muted $xs={{ display: "none" }}>
              {" · "}
            </NookText>
            <NookText muted>{formatTimestampDate(cast.timestamp)}</NookText>
            {cast.channel && (
              <FarcasterChannelBadge channel={cast.channel} asLink />
            )}
          </XStack>
        </XStack>
      </YStack>
      <XStack
        alignItems="center"
        justifyContent="space-around"
        borderTopWidth="$0.5"
        borderTopColor="$borderColorBg"
        borderBottomWidth="$0.5"
        borderBottomColor="$borderColorBg"
        paddingVertical="$2"
      >
        <FarcasterReplyActionButton cast={cast} />
        <FarcasterRecastActionButton cast={cast} setRecasts={setRecasts} />
        <FarcasterLikeActionButton cast={cast} setLikes={setLikes} />
        <FarcasterCustomActionButton cast={cast} />
        <FarcasterShareButton cast={cast} />
      </XStack>
      <View borderBottomWidth="$0.5" borderBottomColor="$borderColorBg">
        <ToggleGroup
          type="single"
          borderWidth="$0"
          width="auto"
          alignSelf="flex-end"
          justifyContent="center"
          margin="$2"
          size="$3"
          value={replySort}
          onValueChange={(value) =>
            onReplySortChange((value as "best" | "top" | "new") || replySort)
          }
        >
          {[
            { value: "best", label: "Best", Icon: Rocket },
            { value: "top", label: "Top", Icon: BarChartBig },
            { value: "new", label: "New", Icon: Clock },
          ].map(({ value, label, Icon }) => (
            <Tooltip delay={100} placement="top" key={value}>
              <Tooltip.Trigger>
                <ToggleGroup.Item value={value}>
                  <Icon size={16} />
                </ToggleGroup.Item>
              </Tooltip.Trigger>
              <Tooltip.Content
                enterStyle={{ x: 0, y: -5, opacity: 0, scale: 0.9 }}
                exitStyle={{ x: 0, y: -5, opacity: 0, scale: 0.9 }}
                scale={1}
                x={0}
                y={0}
                opacity={1}
                animation={[
                  "100ms",
                  {
                    opacity: {
                      overshootClamping: true,
                    },
                  },
                ]}
              >
                <Tooltip.Arrow />
                <NookText color="$color1" fontWeight="500" fontSize="$4">
                  {label}
                </NookText>
              </Tooltip.Content>
            </Tooltip>
          ))}
        </ToggleGroup>
      </View>
    </View>
  );
};
