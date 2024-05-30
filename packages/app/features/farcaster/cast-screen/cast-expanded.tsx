"use client";

import {
  NookText,
  View,
  XStack,
  YStack,
  ToggleGroup,
  Tooltip,
  ScrollView,
} from "@nook/app-ui";
import { FarcasterUserDisplay } from "../../../components/farcaster/users/user-display";
import { FarcasterCastResponseText } from "../../../components/farcaster/casts/cast-text";
import { Embeds } from "../../../components/embeds/Embed";
import { FarcasterCastResponseEngagement } from "../../../components/farcaster/casts/cast-engagement";
import { FarcasterChannelBadge } from "../../../components/farcaster/channels/channel-display";
import { fetchCast } from "../../../api/farcaster";
import {
  FarcasterLikeActionButton,
  FarcasterRecastActionButton,
  FarcasterReplyActionButton,
  FarcasterShareButton,
} from "../../../components/farcaster/casts/cast-actions";
import { FarcasterCustomActionButton } from "../../../components/farcaster/casts/cast-custom-action";
import {
  Display,
  FarcasterCastV1,
  FetchCastsResponse,
} from "@nook/common/types";
import { FarcasterInfiniteFeed } from "../cast-feed/infinite-feed";
import { BarChartBig, Clock, Rocket } from "@tamagui/lucide-icons";
import { Ref, memo, useEffect, useRef, useState } from "react";
import { FarcasterCastResponseMenu } from "../../../components/farcaster/casts/cast-menu";
import { FarcasterCastLink } from "../../../components/farcaster/casts/cast-link";
import { View as RNView, ScrollView as RNScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useCastReplies } from "../../../hooks/api/feed";

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

export const FarcasterExpandedCast = memo(
  ({
    cast,
    initialData,
    paddingBottom,
  }: {
    cast: FarcasterCastV1;
    initialData?: FetchCastsResponse;
    paddingBottom: number;
  }) => {
    const [replySort, setReplySort] = useState<"best" | "top" | "new">("best");
    const {
      data,
      hasNextPage,
      fetchNextPage,
      isFetchingNextPage,
      refresh,
      isRefetching,
    } = useCastReplies(cast.hash, replySort, initialData);

    const scrollViewRef = useRef<RNScrollView>(null);
    const viewRef = useRef<RNView>(null);

    const { data: ancestors } = useQuery({
      queryKey: ["castAncestors", cast.hash],
      queryFn: () => fetchCast(cast.hash),
    });

    const casts = data?.pages.flatMap((page) => page.data) ?? [];

    return (
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => {
          if (scrollViewRef.current && viewRef.current) {
            viewRef.current.measureLayout(
              // @ts-ignore
              scrollViewRef.current,
              (x, y, width, height) => {
                scrollViewRef.current?.scrollTo({
                  x: 0,
                  y: y,
                  animated: false,
                });
              },
            );
          }
        }}
      >
        <YStack gap="$3">
          {ancestors?.ancestors?.map((ancestor) => (
            <FarcasterCastLink
              key={ancestor.hash}
              cast={ancestor}
              displayMode={Display.LIST}
            />
          ))}
        </YStack>
        <FarcasterExpandedCastHeader
          cast={cast}
          replySort={replySort}
          onReplySortChange={setReplySort}
          viewRef={viewRef}
        />
        <View minHeight={500}>
          <FarcasterInfiniteFeed
            casts={casts}
            fetchNextPage={fetchNextPage}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={hasNextPage}
            displayMode={Display.REPLIES}
            refetch={refresh}
            isRefetching={isRefetching}
            paddingBottom={paddingBottom}
          />
        </View>
      </ScrollView>
    );
  },
);

const FarcasterExpandedCastHeader = memo(
  ({
    cast,
    replySort,
    onReplySortChange,
    viewRef,
  }: {
    cast: FarcasterCastV1;
    replySort: "best" | "top" | "new";
    onReplySortChange: (sort: "best" | "top" | "new") => void;
    viewRef: Ref<RNView>;
  }) => {
    const renderText = cast.text || cast.mentions.length > 0;
    const renderEmbeds = cast.embeds.length > 0 || cast.embedCasts.length > 0;

    return (
      <View>
        <YStack gap="$3" padding="$2.5" ref={viewRef}>
          <XStack justifyContent="space-between">
            <FarcasterUserDisplay user={cast.user} asLink />
            <FarcasterCastResponseMenu cast={cast} />
          </XStack>
          {renderText && (
            <FarcasterCastResponseText cast={cast} fontSize="$6" />
          )}
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
        <XStack
          borderBottomWidth="$0.5"
          borderBottomColor="$borderColorBg"
          alignItems="center"
          justifyContent="space-between"
          paddingLeft="$2.5"
        >
          <NookText muted fontWeight="500" fontSize="$4" color="$mauve10">
            Sort replies
          </NookText>
          <ToggleGroup
            type="single"
            borderWidth="$0"
            width="auto"
            alignSelf="flex-end"
            justifyContent="center"
            size="$3"
            borderRadius="$0"
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
                    <XStack gap="$2" alignItems="center">
                      <Icon
                        size={16}
                        color={value === replySort ? "$color12" : "$mauve10"}
                      />
                      <NookText
                        fontSize="$4"
                        fontWeight="500"
                        color={value === replySort ? "$color12" : "$mauve10"}
                      >
                        {label}
                      </NookText>
                    </XStack>
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
        </XStack>
      </View>
    );
  },
);
