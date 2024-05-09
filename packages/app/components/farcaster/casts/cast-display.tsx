"use client";

import { Display, FarcasterCastResponse } from "@nook/common/types";
import { NookText, Separator, View, XStack, YStack } from "@nook/app-ui";
import { FarcasterCastResponseText } from "../../../components/farcaster/casts/cast-text";
import {
  FarcasterUserAvatar,
  FarcasterUserDisplay,
} from "../../../components/farcaster/users/user-display";
import { formatTimeAgo } from "../../../utils";
import { FarcasterChannelBadge } from "../../../components/farcaster/channels/channel-display";
import { Embeds } from "../../../components/embeds/Embed";
import { FarcasterCastResponseEngagement } from "../../../components/farcaster/casts/cast-engagement";
import {
  FarcasterLikeActionButton,
  FarcasterRecastActionButton,
  FarcasterReplyActionButton,
  FarcasterShareButton,
} from "../../../components/farcaster/casts/cast-actions";
import { FarcasterCustomActionButton } from "../../../components/farcaster/casts/cast-custom-action";
import { FarcasterCastResponseKebabMenu } from "./cast-kebab-menu";
import { EmbedImage } from "../../embeds/EmbedImage";
import { EmbedVideo } from "../../embeds/EmbedVideo";
import { EmbedFrame } from "../../embeds/EmbedFrame";
import { useMuteStore } from "../../../store/useMuteStore";
import { FarcasterPowerBadge } from "../users/power-badge";

export const FarcasterCastResponseDisplay = ({
  cast,
  displayMode,
}: { cast: FarcasterCastResponse; displayMode: Display }) => {
  const mutedUsers = useMuteStore((state) => state.users);
  const mutedChannels = useMuteStore((state) => state.channels);
  const deletedCasts = useMuteStore((state) => state.casts);

  if (
    mutedUsers[cast.user.username || cast.user.fid] ||
    (cast.channel && mutedChannels[cast.channel.url]) ||
    deletedCasts[cast.hash]
  ) {
    return null;
  }

  switch (displayMode) {
    case Display.FRAMES:
      return <FarcasterCastResponseFrameDisplay cast={cast} />;
    case Display.MEDIA:
      return <FarcasterCastResponseMediaDisplay cast={cast} />;
    case Display.GRID:
      return <FarcasterCastResponseGridDisplay cast={cast} />;
    case Display.LIST:
      return <FarcasterCastResponseDefaultDisplay cast={cast} isConnected />;
    case Display.BORDERLESS:
      return <FarcasterCastResponseDefaultDisplay cast={cast} />;
    default:
      if (cast.parent && displayMode !== Display.REPLIES) {
        return (
          <View borderBottomWidth="$0.5" borderBottomColor="$borderColorBg">
            <FarcasterCastResponseDefaultDisplay
              cast={cast.parent}
              isConnected
            />
            <FarcasterCastResponseDefaultDisplay cast={cast} />
          </View>
        );
      }
      return (
        <View borderBottomWidth="$0.5" borderBottomColor="$borderColorBg">
          <FarcasterCastResponseDefaultDisplay cast={cast} />
        </View>
      );
  }
};

const FarcasterCastResponseFrameDisplay = ({
  cast,
}: { cast: FarcasterCastResponse }) => {
  const frameEmbed = cast.embeds.find((embed) => embed.frame);

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
        <FarcasterCastResponseKebabMenu cast={cast} />
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

const FarcasterCastResponseGridDisplay = ({
  cast,
}: { cast: FarcasterCastResponse }) => {
  const imageEmbed = cast.embeds.find((embed) =>
    embed.contentType?.startsWith("image"),
  );

  if (!imageEmbed) {
    return null;
  }

  return (
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
  );
};

const FarcasterCastResponseMediaDisplay = ({
  cast,
}: { cast: FarcasterCastResponse }) => {
  const imageEmbed = cast.embeds.find((embed) =>
    embed.contentType?.startsWith("image"),
  );
  const videoEmbed = cast.embeds.find(
    (embed) => embed.contentType === "application/x-mpegURL",
  );

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
      cursor="pointer"
    >
      <XStack justifyContent="space-between" padding="$3">
        <FarcasterUserDisplay
          user={cast.user}
          size="$3"
          suffix={` · ${formatTimeAgo(cast.timestamp)}`}
        />
        <FarcasterCastResponseKebabMenu cast={cast} />
      </XStack>
      {imageEmbed && <EmbedImage uri={imageEmbed.uri} noBorderRadius />}
      {videoEmbed && <EmbedVideo uri={videoEmbed.uri} noBorderRadius />}
      <YStack padding="$3" gap="$2">
        {(cast.text || cast.mentions.length > 0) && (
          <NookText>
            <NookText fontWeight="600" color="$mauve12">
              {cast.user.username || `!${cast.user.fid}`}{" "}
            </NookText>
            <FarcasterCastResponseText cast={cast} />
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

const FarcasterCastResponseDefaultDisplay = ({
  cast,
  isConnected,
}: { cast: FarcasterCastResponse; isConnected?: boolean }) => {
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
      cursor="pointer"
      padding="$3"
    >
      <YStack alignItems="center" width="$4" marginTop="$1">
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
          <XStack
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <XStack gap="$1.5" alignItems="center" flexShrink={1}>
              <NookText fontWeight="700" numberOfLines={1} ellipsizeMode="tail">
                {`${
                  cast.user.displayName ||
                  cast.user.username ||
                  `!${cast.user.fid}`
                }`}
              </NookText>
              <FarcasterPowerBadge
                badge={cast.user.badges?.powerBadge ?? false}
              />
              <NookText
                muted
                numberOfLines={1}
                ellipsizeMode="middle"
                flexShrink={1}
              >
                {`${
                  cast.user.username
                    ? `@${cast.user.username}`
                    : `!${cast.user.fid}`
                } · ${formatTimeAgo(cast.timestamp)}`}
              </NookText>
            </XStack>
            <FarcasterCastResponseKebabMenu cast={cast} />
          </XStack>
          {renderText && <FarcasterCastResponseText cast={cast} />}
        </YStack>
        {renderEmbeds && <Embeds cast={cast} />}
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
        {renderEngagementBar && (
          <XStack justifyContent="space-between" alignItems="center">
            <FarcasterCastResponseEngagement
              cast={cast}
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
