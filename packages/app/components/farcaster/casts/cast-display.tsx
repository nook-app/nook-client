"use client";

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
import { FarcasterCastKebabMenu } from "./cast-kebab-menu";
import { useState } from "react";
import { EmbedImage } from "../../embeds/EmbedImage";
import { EmbedVideo } from "../../embeds/EmbedVideo";
import { EmbedFrame } from "../../embeds/EmbedFrame";

export const FarcasterCastDisplay = ({
  cast,
  displayMode,
  queryKey,
}: { cast: FarcasterCast; displayMode: Display; queryKey?: string[] }) => {
  switch (displayMode) {
    case Display.FRAMES:
      return <FarcasterCastFrameDisplay cast={cast} />;
    case Display.MEDIA:
      return <FarcasterCastMediaDisplay cast={cast} />;
    case Display.GRID:
      return <FarcasterCastGridDisplay cast={cast} />;
    default:
      if (cast.parent && displayMode !== Display.REPLIES) {
        return (
          <View borderBottomWidth="$0.5" borderBottomColor="$borderColorBg">
            <FarcasterCastDefaultDisplay
              cast={cast.parent}
              isConnected
              queryKey={queryKey}
            />
            <FarcasterCastDefaultDisplay cast={cast} queryKey={queryKey} />
          </View>
        );
      }
      return (
        <View borderBottomWidth="$0.5" borderBottomColor="$borderColorBg">
          <FarcasterCastDefaultDisplay cast={cast} queryKey={queryKey} />
        </View>
      );
  }
};

const FarcasterCastFrameDisplay = ({ cast }: { cast: FarcasterCast }) => {
  const router = useRouter();

  const frameEmbed = cast.embeds.find((embed) => embed.frame);

  const handlePress = () => {
    const selection = window?.getSelection()?.toString();
    if (!selection || selection.length === 0) {
      router.push(`/casts/${cast.hash}`);
    }
  };

  if (!frameEmbed) {
    return null;
  }

  return (
    <YStack
      borderBottomWidth="$0.25"
      borderBottomColor="$color4"
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        backgroundColor: "$color2",
      }}
      onPress={handlePress}
      cursor="pointer"
      padding="$3"
      gap="$3"
    >
      <XStack justifyContent="space-between">
        <FarcasterUserDisplay
          user={cast.user}
          size="$3"
          suffix={` · ${formatTimeAgo(cast.timestamp)}`}
        />
        <FarcasterCastKebabMenu cast={cast} />
      </XStack>
      <EmbedFrame cast={cast} content={frameEmbed} />
      <YStack padding="$2" gap="$2">
        <XStack
          alignItems="center"
          justifyContent="space-between"
          marginHorizontal="$-2"
        >
          <XStack gap="$2" alignItems="center">
            <FarcasterReplyActionButton cast={cast} />
            <FarcasterRecastActionButton cast={cast} />
            <FarcasterLikeActionButton cast={cast} />
          </XStack>
          <XStack gap="$2" alignItems="center">
            <FarcasterCustomActionButton cast={cast} />
            <FarcasterShareButton cast={cast} />
          </XStack>
        </XStack>
      </YStack>
    </YStack>
  );
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
        borderColor="$borderColor"
        hoverStyle={{
          // @ts-ignore
          transition: "all 0.2s ease-in-out",
          opacity: 0.75,
        }}
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
  const router = useRouter();

  const imageEmbed = cast.embeds.find((embed) =>
    embed.type?.startsWith("image"),
  );
  const videoEmbed = cast.embeds.find(
    (embed) => embed.type === "application/x-mpegURL",
  );

  const handlePress = () => {
    const selection = window?.getSelection()?.toString();
    if (!selection || selection.length === 0) {
      router.push(`/casts/${cast.hash}`);
    }
  };

  if (!imageEmbed && !videoEmbed) {
    return null;
  }

  return (
    <YStack
      borderBottomWidth="$0.25"
      borderBottomColor="$color4"
      paddingVertical="$1"
      hoverStyle={{
        // @ts-ignore
        transition: "all 0.2s ease-in-out",
        backgroundColor: "$color2",
      }}
      onPress={handlePress}
      cursor="pointer"
    >
      <XStack justifyContent="space-between" padding="$3">
        <FarcasterUserDisplay
          user={cast.user}
          size="$3"
          suffix={` · ${formatTimeAgo(cast.timestamp)}`}
        />
        <FarcasterCastKebabMenu cast={cast} />
      </XStack>
      {imageEmbed && <EmbedImage uri={imageEmbed.uri} noBorderRadius />}
      {videoEmbed && <EmbedVideo uri={videoEmbed.uri} noBorderRadius />}
      <YStack padding="$3" gap="$2">
        {(cast.text || cast.mentions.length > 0) && (
          <NookText>
            <NookText fontWeight="600" color="$mauve12">
              {cast.user.username || `!${cast.user.fid}`}{" "}
            </NookText>
            <FarcasterCastText cast={cast} />
          </NookText>
        )}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          marginHorizontal="$-2"
        >
          <XStack gap="$2" alignItems="center">
            <FarcasterReplyActionButton cast={cast} />
            <FarcasterRecastActionButton cast={cast} />
            <FarcasterLikeActionButton cast={cast} />
          </XStack>
          <XStack gap="$2" alignItems="center">
            <FarcasterCustomActionButton cast={cast} />
            <FarcasterShareButton cast={cast} />
          </XStack>
        </XStack>
      </YStack>
    </YStack>
  );
};

export const FarcasterCastDefaultDisplay = ({
  cast,
  isConnected,
  queryKey,
}: { cast: FarcasterCast; isConnected?: boolean; queryKey?: string[] }) => {
  const [likes, setLikes] = useState(cast.engagement.likes || 0);
  const [recasts, setRecasts] = useState(cast.engagement.recasts || 0);
  const router = useRouter();

  const handlePress = () => {
    const selection = window?.getSelection()?.toString();
    if (!selection || selection.length === 0) {
      router.push(`/casts/${cast.hash}`);
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
      padding="$3"
    >
      <YStack alignItems="center" width="$4">
        <FarcasterUserAvatar user={cast.user} size="$4" asLink />
        {isConnected && (
          <Separator
            vertical
            marginBottom="$-8"
            borderWidth="$0.5"
            borderColor="$borderColorBg"
            zIndex={1}
          />
        )}
      </YStack>
      <YStack flex={1} gap="$2">
        <YStack gap="$1.5">
          <XStack justifyContent="space-between">
            <FarcasterUserTextDisplay
              user={cast.user}
              asLink
              suffix={` · ${formatTimeAgo(cast.timestamp)}`}
            />
            <View position="absolute" right={0} top={0} marginTop="$-2">
              <FarcasterCastKebabMenu cast={cast} queryKey={queryKey} />
            </View>
          </XStack>
          {renderText && <FarcasterCastText cast={cast} />}
        </YStack>
        {renderEmbeds && <Embeds cast={cast} />}
        <XStack
          alignItems="center"
          justifyContent="space-between"
          marginHorizontal="$-2"
        >
          <XStack gap="$2" alignItems="center">
            <FarcasterReplyActionButton cast={cast} />
            <FarcasterRecastActionButton cast={cast} setRecasts={setRecasts} />
            <FarcasterLikeActionButton cast={cast} setLikes={setLikes} />
          </XStack>
          <XStack gap="$2" alignItems="center">
            <FarcasterCustomActionButton cast={cast} />
            <FarcasterShareButton cast={cast} />
          </XStack>
        </XStack>
        {renderEngagementBar && (
          <XStack justifyContent="space-between" alignItems="center">
            <FarcasterCastEngagement
              hash={cast.hash}
              engagement={{ ...cast.engagement, likes, recasts }}
              types={["likes", "replies"]}
            />
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
