"use client";

import { Input, NookText, View, XStack, YStack } from "@nook/ui";
import { Channel } from "../../../types";
import { CdnAvatar } from "../../../components/cdn-avatar";
import { FarcasterBioText } from "../../../components/farcaster/bio-text";
import { formatNumber } from "../../../utils";
import { useUsers } from "../../../api/farcaster";
import { FarcasterUserDisplay } from "../../../components/farcaster/user-display";
import { FarcasterUserFollowButton } from "../../../components/farcaster/user-follow-button";
import { SearchBar } from "../../search/search-bar";

export const ChannelSidebar = ({ channel }: { channel: Channel }) => {
  return (
    <YStack
      padding="$3"
      gap="$3"
      top={0}
      $platform-web={{
        position: "sticky",
      }}
    >
      <SearchBar />
      <ChannelOverview channel={channel} />
      <ChannelHosts channel={channel} />
    </YStack>
  );
};

const ChannelOverview = ({ channel }: { channel: Channel }) => {
  const bio = channel?.description?.trim().replace(/\n\s*\n/g, "\n");
  return (
    <YStack
      padding="$3"
      gap="$3"
      borderRadius="$4"
      backgroundColor="$color2"
      borderColor="$color4"
      borderWidth="$0.5"
    >
      <XStack gap="$2">
        <CdnAvatar src={channel.imageUrl} size="$4" />
        <YStack gap="$1">
          <NookText variant="label">{channel.name}</NookText>
          <NookText muted fontSize="$4">{`/${channel.channelId}`}</NookText>
        </YStack>
      </XStack>
      {bio && <FarcasterBioText text={bio} />}
      <XStack alignItems="center" justifyContent="space-between">
        <View flexDirection="row" alignItems="center" gap="$1.5">
          <NookText fontWeight="600">
            {formatNumber(channel.followerCount || 0)}
          </NookText>
          <NookText muted>followers</NookText>
        </View>
        {channel.createdAt && (
          <View flexDirection="row" alignItems="center" gap="$1.5">
            <NookText muted>since</NookText>
            <NookText fontWeight="600">
              {new Date(channel.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </NookText>
          </View>
        )}
      </XStack>
    </YStack>
  );
};

const ChannelHosts = ({ channel }: { channel: Channel }) => {
  const { data, isLoading } = useUsers(channel.hostFids || []);

  if (isLoading) return null;

  const lead = data?.data?.find((user) => user.fid === channel.creatorId);
  const others = data?.data?.filter((user) => user.fid !== channel.creatorId);

  return (
    <YStack
      gap="$3"
      padding="$3"
      borderRadius="$4"
      backgroundColor="$color2"
      borderColor="$color4"
      borderWidth="$0.5"
    >
      <NookText variant="label">Hosts</NookText>
      {lead && (
        <XStack alignItems="center" justifyContent="space-between" gap="$4">
          <FarcasterUserDisplay user={lead} asLink />
          <FarcasterUserFollowButton fid={lead.fid} />
        </XStack>
      )}
      {others?.map((user) => (
        <XStack
          alignItems="center"
          justifyContent="space-between"
          gap="$4"
          key={user.fid}
        >
          <FarcasterUserDisplay user={user} asLink />
          <FarcasterUserFollowButton fid={user.fid} />
        </XStack>
      ))}
    </YStack>
  );
};
