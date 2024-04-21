import { Text, View, XStack, YStack } from "tamagui";
import {
  Channel,
  FarcasterCast as FarcasterCastType,
  FarcasterUser,
  PanelDisplay,
} from "@/types";
import {
  fetchCast,
  fetchCastReplies,
  fetchNewCastReplies,
  fetchTopCastReplies,
} from "@/utils/api";
import { memo, useRef, useState } from "react";
import { View as RNView } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCast } from "@/hooks/useCast";
import { useAuth } from "@/context/auth";
import { hasCastDiff, hasChannelDiff, hasUserDiff } from "@/utils";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  FarcasterCastLikeButton,
  FarcasterCastRecastButton,
  FarcasterCastReplyButton,
  FarcasterCastTipButton,
} from "@/components/farcaster/FarcasterCastActions";
import { FarcasterCastCustomAction } from "@/components/farcaster/FarcasterCastCustomAction";
import { DebouncedLink } from "@/components/DebouncedLink";
import { EmbedCast } from "@/components/embeds/EmbedCast";
import { Embeds } from "@/components/embeds/Embed";
import { FarcasterCastText } from "@/components/farcaster/FarcasterCastText";
import {
  FarcasterCast,
  FarcasterCastHeader,
} from "@/components/farcaster/FarcasterCast";
import { UserAvatar } from "@/components/UserAvatar";
import { FarcasterFeedPanel } from "@/components/farcaster/FarcasterFeedPanel";
import { IconButton } from "@/components/IconButton";
import {
  ArrowLeft,
  BarChartBig,
  History,
  Rocket,
  SlidersHorizontal,
} from "@tamagui/lucide-icons";
import { SheetType, useSheets } from "@/context/sheet";

const SORT_OPTIONS = [
  {
    value: "",
    label: (active: boolean) => (
      <XStack gap="$3">
        <Rocket size={20} color={active ? "$mauve12" : "$mauve11"} />
        <Text
          fontWeight="600"
          fontSize="$5"
          color={active ? "$mauve12" : "$mauve11"}
        >
          Best
        </Text>
      </XStack>
    ),
  },
  {
    value: "new",
    label: (active: boolean) => (
      <XStack gap="$3">
        <History size={20} color={active ? "$mauve12" : "$mauve11"} />
        <Text
          fontWeight="600"
          fontSize="$5"
          color={active ? "$mauve12" : "$mauve11"}
        >
          New
        </Text>
      </XStack>
    ),
  },
  {
    value: "top",
    label: (active: boolean) => (
      <XStack gap="$3">
        <BarChartBig size={20} color={active ? "$mauve12" : "$mauve11"} />
        <Text
          fontWeight="600"
          fontSize="$5"
          color={active ? "$mauve12" : "$mauve11"}
        >
          Top
        </Text>
      </XStack>
    ),
  },
];

export default function CastScreen() {
  const { hash } = useLocalSearchParams();
  const height = useBottomTabBarHeight();
  const { openSheet } = useSheets();
  const [sortOption, setSortOption] = useState(SORT_OPTIONS[0].value);

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => (
            <IconButton onPress={() => router.back()}>
              <ArrowLeft size={16} color="white" />
            </IconButton>
          ),

          headerRight: () => (
            <IconButton
              onPress={() =>
                openSheet(SheetType.OptionSelector, {
                  value: sortOption,
                  options: SORT_OPTIONS,
                  onSelect: (option) => setSortOption(option),
                })
              }
            >
              <SlidersHorizontal size={16} color="white" />
            </IconButton>
          ),
        }}
      />
      <View flex={1} backgroundColor="$color1" paddingBottom={height}>
        <FarcasterFeedPanel
          keys={["replyCasts", sortOption, hash as string]}
          fetch={async ({ pageParam }) => {
            const fn =
              sortOption === "new"
                ? fetchNewCastReplies
                : sortOption === "top"
                  ? fetchTopCastReplies
                  : fetchCastReplies;
            const result = await fn(hash as string, pageParam);
            return {
              ...result,
              data: result.data,
            };
          }}
          display={PanelDisplay.REPLIES}
          ListHeaderComponent={<FarcasterCastListHeader />}
        />
      </View>
    </>
  );
}

const FarcasterCastListHeader = memo(() => {
  const { hash } = useLocalSearchParams();
  const viewRef = useRef<RNView>(null);
  const queryClient = useQueryClient();

  const { data: cast } = useQuery({
    queryKey: ["castExpanded", hash],
    queryFn: async () => {
      const result = await fetchCast(hash as string);
      queryClient.setQueryData(["cast", hash], result);

      const relatedCasts = [];
      if (result?.ancestors) {
        for (const cast of result.ancestors) {
          relatedCasts.push(cast);
        }
      }

      if (result?.thread) {
        for (const cast of result.thread) {
          relatedCasts.push(cast);
        }
      }

      if (relatedCasts.length > 0) {
        for (const cast of relatedCasts) {
          const existingCast = queryClient.getQueryData<FarcasterCastType>([
            "cast",
            cast.hash,
          ]);
          if (!existingCast || hasCastDiff(existingCast, cast)) {
            queryClient.setQueryData(["cast", cast.hash], cast);
          }

          const existingUser = queryClient.getQueryData<FarcasterUser>([
            "user",
            cast.user.fid,
          ]);
          if (!existingUser || hasUserDiff(existingUser, cast.user)) {
            queryClient.setQueryData(["user", cast.user.fid], cast.user);
          }

          for (const mention of cast.mentions) {
            const existingUser = queryClient.getQueryData<FarcasterUser>([
              "user",
              mention.user.fid,
            ]);
            if (!existingUser || hasUserDiff(existingUser, mention.user)) {
              queryClient.setQueryData(
                ["user", mention.user.fid],
                mention.user,
              );
            }
          }

          if (cast.channel) {
            const existingChannel = queryClient.getQueryData<Channel>([
              "channel",
              cast.channel.channelId,
            ]);
            if (
              !existingChannel ||
              hasChannelDiff(existingChannel, cast.channel)
            ) {
              queryClient.setQueryData(
                ["channel", cast.channel.channelId],
                cast.channel,
              );
            }
          }

          for (const embed of cast.embedCasts) {
            const existingCast = queryClient.getQueryData<FarcasterCastType>([
              "cast",
              embed.hash,
            ]);
            if (!existingCast || hasCastDiff(existingCast, embed)) {
              queryClient.setQueryData(["cast", embed.hash], embed);
            }
          }

          if (cast.parent) {
            const existingCast = queryClient.getQueryData<FarcasterCastType>([
              "cast",
              cast.parent.hash,
            ]);
            if (!existingCast || hasCastDiff(existingCast, cast.parent)) {
              queryClient.setQueryData(["cast", cast.parent.hash], cast.parent);
            }

            const existingUser = queryClient.getQueryData<FarcasterUser>([
              "user",
              cast.parent.user.fid,
            ]);
            if (!existingUser || hasUserDiff(existingUser, cast.parent.user)) {
              queryClient.setQueryData(
                ["user", cast.parent.user.fid],
                cast.parent.user,
              );
            }

            for (const mention of cast.parent.mentions) {
              const existingUser = queryClient.getQueryData<FarcasterUser>([
                "user",
                mention.user.fid,
              ]);
              if (!existingUser || hasUserDiff(existingUser, mention.user)) {
                queryClient.setQueryData(
                  ["user", mention.user.fid],
                  mention.user,
                );
              }
            }

            if (cast.parent.channel) {
              const existingChannel = queryClient.getQueryData<Channel>([
                "channel",
                cast.parent.channel.channelId,
              ]);
              if (
                !existingChannel ||
                hasChannelDiff(existingChannel, cast.parent.channel)
              ) {
                queryClient.setQueryData(
                  ["channel", cast.parent.channel.channelId],
                  cast.parent.channel,
                );
              }
            }

            for (const embed of cast.parent.embedCasts) {
              const existingCast = queryClient.getQueryData<FarcasterCastType>([
                "cast",
                embed.hash,
              ]);
              if (!existingCast || hasCastDiff(existingCast, embed)) {
                queryClient.setQueryData(["cast", embed.hash], embed);
              }
            }
          }
        }
      }
      return result;
    },
    enabled: !!hash,
  });

  if (!cast) return null;

  return (
    <View>
      <View
        borderBottomWidth="$0.5"
        borderBottomColor="$borderColor"
        padding="$2.5"
      >
        {cast.ancestors &&
          [...cast.ancestors]
            .reverse()
            .map((ancestor) => (
              <FarcasterCast
                key={ancestor.hash}
                cast={ancestor}
                disableParent
                isReply
              />
            ))}
        <View ref={viewRef}>
          <FarcasterCastContent cast={cast} />
        </View>
      </View>
      <FarcasterCastActionBar hash={cast.hash} />
      {cast.thread && cast.thread.length > 0 && (
        <View
          borderBottomWidth="$0.5"
          borderBottomColor="$borderColor"
          padding="$2.5"
        >
          {cast.thread.map((c, i) => {
            return (
              <FarcasterCast
                key={c.hash}
                cast={c}
                disableParent
                isReply
                hideSeparator={i === cast.thread.length - 1}
              />
            );
          })}
        </View>
      )}
    </View>
  );
});

const FarcasterCastContent = ({ cast }: { cast: FarcasterCastType }) => {
  return (
    <YStack gap="$1.5">
      <YStack gap="$3">
        <XStack gap="$2">
          <DebouncedLink
            asChild
            href={{
              pathname: `/users/[fid]`,
              params: { fid: cast.user.fid },
            }}
          >
            <View>
              <UserAvatar pfp={cast.user.pfp} size="$4" />
            </View>
          </DebouncedLink>
          <View flex={1}>
            <FarcasterCastHeader cast={cast} />
          </View>
        </XStack>
        {(cast.text || cast.mentions.length > 0) && (
          <FarcasterCastText cast={cast} fontSize="$5" selectable />
        )}
        {cast.embeds.length > 0 && <Embeds cast={cast} />}
        {cast.embedCasts.map((cast, index) => (
          <EmbedCast key={index} cast={cast} />
        ))}
        <XStack alignItems="center" paddingHorizontal="$1" gap="$2">
          {cast.engagement.replies > 0 && (
            <View flexDirection="row" alignItems="center" gap="$1">
              <Text fontWeight="600" color="$mauve12">
                {cast.engagement.replies || 0}
              </Text>
              <Text color="$mauve11">replies</Text>
            </View>
          )}
          {cast.engagement.recasts > 0 && (
            <DebouncedLink
              href={{
                pathname: `/casts/[hash]/recasts`,
                params: { hash: cast.hash },
              }}
              asChild
            >
              <View flexDirection="row" alignItems="center" gap="$1">
                <Text fontWeight="600" color="$mauve12">
                  {cast.engagement.recasts || 0}
                </Text>
                <Text color="$mauve11">recasts</Text>
              </View>
            </DebouncedLink>
          )}
          {cast.engagement.quotes > 0 && (
            <DebouncedLink
              href={{
                pathname: `/casts/[hash]/quotes`,
                params: { hash: cast.hash },
              }}
              asChild
            >
              <View flexDirection="row" alignItems="center" gap="$1">
                <Text fontWeight="600" color="$mauve12">
                  {cast.engagement.quotes || 0}
                </Text>
                <Text color="$mauve11">quotes</Text>
              </View>
            </DebouncedLink>
          )}
          {cast.engagement.likes > 0 && (
            <DebouncedLink
              href={{
                pathname: `/casts/[hash]/likes`,
                params: { hash: cast.hash },
              }}
              asChild
            >
              <View flexDirection="row" alignItems="center" gap="$1">
                <Text fontWeight="600" color="$mauve12">
                  {cast.engagement.likes || 0}
                </Text>
                <Text color="$mauve11">likes</Text>
              </View>
            </DebouncedLink>
          )}
        </XStack>
      </YStack>
    </YStack>
  );
};

const FarcasterCastActionBar = ({ hash }: { hash: string }) => {
  const { metadata } = useAuth();
  const { cast } = useCast(hash);

  if (!cast) return null;

  return (
    <XStack
      gap="$2"
      justifyContent="space-around"
      alignItems="center"
      padding="$2"
      borderBottomWidth="$0.25"
      borderBottomColor="$borderColor"
    >
      <FarcasterCastReplyButton hash={hash} noWidth />
      <FarcasterCastRecastButton hash={hash} noWidth />
      <FarcasterCastLikeButton hash={hash} noWidth />
      <FarcasterCastCustomAction hash={hash} noWidth />
      {metadata?.enableDegenTip && (
        <FarcasterCastTipButton hash={hash} noWidth />
      )}
    </XStack>
  );
};
