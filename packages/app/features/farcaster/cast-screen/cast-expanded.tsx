"use client";

import {
  NookText,
  View,
  XStack,
  YStack,
  ToggleGroup,
  Tooltip,
} from "@nook/app-ui";
import { FarcasterUserDisplay } from "../../../components/farcaster/users/user-display";
import { FarcasterCastResponseText } from "../../../components/farcaster/casts/cast-text";
import { Embeds } from "../../../components/embeds/Embed";
import { FarcasterCastResponseEngagement } from "../../../components/farcaster/casts/cast-engagement";
import { FarcasterChannelBadge } from "../../../components/farcaster/channels/channel-display";
import { useCastReplies } from "../../../api/farcaster";
import {
  FarcasterLikeActionButton,
  FarcasterRecastActionButton,
  FarcasterReplyActionButton,
  FarcasterShareButton,
} from "../../../components/farcaster/casts/cast-actions";
import { FarcasterCustomActionButton } from "../../../components/farcaster/casts/cast-custom-action";
import {
  Display,
  FarcasterCastResponse,
  FetchCastsResponse,
} from "@nook/common/types";
import { FarcasterInfiniteFeed } from "../cast-feed/infinite-feed";
import { BarChartBig, Clock, Rocket } from "@tamagui/lucide-icons";
import { useState } from "react";
import { FarcasterCastResponseKebabMenu } from "../../../components/farcaster/casts/cast-kebab-menu";
import { Loading } from "../../../components/loading";
import { FarcasterCastLink } from "../../../components/farcaster/casts/cast-link";

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

export const FarcasterExpandedCast = ({
  cast,
  initialData,
}: { cast: FarcasterCastResponse; initialData?: FetchCastsResponse }) => {
  const [replySort, setReplySort] = useState<"best" | "top" | "new">("best");
  const [isRefetching, setIsRefetching] = useState(false);
  const { data, hasNextPage, fetchNextPage, isFetchingNextPage, refetch } =
    useCastReplies(cast.hash, replySort, initialData);

  const casts = data?.pages.flatMap((page) => page.data) ?? [];

  const handleRefresh = async () => {
    setIsRefetching(true);
    await refetch();
    setIsRefetching(false);
  };

  return (
    <FarcasterInfiniteFeed
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
      refetch={handleRefresh}
      isRefetching={isRefetching}
    />
  );
};

const FarcasterExpandedCastHeader = ({
  cast,
  replySort,
  onReplySortChange,
}: {
  cast: FarcasterCastResponse;
  replySort: "best" | "top" | "new";
  onReplySortChange: (sort: "best" | "top" | "new") => void;
}) => {
  const renderText = cast.text || cast.mentions.length > 0;
  const renderEmbeds = cast.embeds.length > 0 || cast.embedCasts.length > 0;

  console.log("2", cast.ancestors);

  return (
    <View>
      {cast.ancestors?.toReversed?.().map((ancestor) => (
        <FarcasterCastLink
          key={ancestor.hash}
          cast={ancestor}
          displayMode={Display.LIST}
        />
      ))}
      <YStack gap="$3" padding="$3">
        <XStack justifyContent="space-between">
          <FarcasterUserDisplay user={cast.user} asLink />
          <FarcasterCastResponseKebabMenu cast={cast} />
        </XStack>
        {renderText && <FarcasterCastResponseText cast={cast} fontSize="$6" />}
        {renderEmbeds && <Embeds cast={cast} />}
        <XStack
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          $sm={{
            flexDirection: "column-reverse",
            alignItems: "flex-start",
            gap: "$3",
          }}
        >
          <FarcasterCastResponseEngagement
            cast={cast}
            types={["likes", "replies", "quotes", "recasts"]}
          />
          <XStack alignItems="center" gap="$1.5">
            <NookText muted>{formatTimestampTime(cast.timestamp)}</NookText>
            <NookText muted>{"·"}</NookText>
            <NookText muted>{formatTimestampDate(cast.timestamp)}</NookText>
            {cast.channel && (
              <>
                <NookText muted>{"·"}</NookText>
                <FarcasterChannelBadge channel={cast.channel} asLink />
              </>
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
        <FarcasterRecastActionButton cast={cast} />
        <FarcasterLikeActionButton cast={cast} />
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
