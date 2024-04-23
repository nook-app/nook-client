"use client";

import { FarcasterCast } from "../../../types";
import { NookText, Spinner, View, XStack, YStack } from "@nook/ui";
import { useCast } from "../../../api/farcaster";
import { FarcasterCastText } from "../../../components/farcaster/casts/cast-text";
import {
  FarcasterUserAvatar,
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
import {
  AutoSizer,
  InfiniteLoader,
  List,
  WindowScroller,
  CellMeasurer,
  CellMeasurerCache,
} from "react-virtualized";
import { CSSProperties, useEffect } from "react";

const cache = new CellMeasurerCache({
  fixedWidth: true,
  defaultHeight: 100,
});

export const FarcasterInfiniteFeed = ({
  casts,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
}: {
  casts: FarcasterCast[];
  fetchNextPage: () => void;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
}) => {
  return (
    <AutoSizer disableHeight={true}>
      {({ width }) => (
        <WindowScroller>
          {({ height, isScrolling, onChildScroll, scrollTop }) => (
            <InfiniteLoader
              isRowLoaded={({ index }) => !!casts[index]}
              // @ts-ignore
              loadMoreRows={
                isFetchingNextPage ? () => {} : () => fetchNextPage()
              }
              rowCount={casts.length + (hasNextPage ? 1 : 0)}
            >
              {({ onRowsRendered, registerChild }) => (
                <List
                  autoHeight
                  height={height}
                  width={width}
                  onRowsRendered={onRowsRendered}
                  ref={registerChild}
                  rowCount={casts.length}
                  rowHeight={cache.rowHeight}
                  rowRenderer={({ index, key, style, parent }) => {
                    console.log(index, casts.length, hasNextPage);
                    if (hasNextPage && index + 1 === casts.length) {
                      return (
                        <View
                          style={style}
                          key={`${key}-loading`}
                          justifyContent="center"
                          alignItems="center"
                        >
                          <Spinner color="$color9" />
                        </View>
                      );
                    }

                    return (
                      <CellMeasurer
                        key={key}
                        cache={cache}
                        parent={parent}
                        columnIndex={0}
                        rowIndex={index}
                      >
                        {({ measure }) => (
                          <FarcasterCastDisplay
                            cast={casts[index]}
                            style={style}
                            measure={measure}
                          />
                        )}
                      </CellMeasurer>
                    );
                  }}
                  isScrolling={isScrolling}
                  onScroll={onChildScroll}
                  scrollTop={scrollTop}
                />
              )}
            </InfiniteLoader>
          )}
        </WindowScroller>
      )}
    </AutoSizer>
  );
};

const FarcasterCastDisplay = ({
  cast,
  style,
  measure,
}: { cast: FarcasterCast; style: CSSProperties; measure: () => void }) => {
  const renderText = cast.text || cast.mentions.length > 0;
  const renderEmbeds = cast.embeds.length > 0 || cast.embedCasts.length > 0;
  const { push } = useRouter();

  const handlePress = () => {
    const selection = window?.getSelection()?.toString();
    if (!selection || selection.length === 0) {
      push(`/casts/${cast.hash}`);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      try {
        measure();
      } catch (e) {}
    }, 300);
  }, [measure]);

  return (
    <XStack
      gap="$2"
      borderBottomWidth="$0.5"
      borderBottomColor="rgba(256, 256, 256, 0.1)"
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
      style={style}
    >
      <YStack alignItems="center" width="$4" marginTop="$1">
        <FarcasterUserAvatar user={cast.user} size="$4" asLink />
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
        <XStack justifyContent="space-between" alignItems="center">
          <FarcasterCastEngagement cast={cast} types={["likes", "replies"]} />
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
