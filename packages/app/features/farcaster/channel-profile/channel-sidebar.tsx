"use client";

import { NookText, View, XStack, YStack } from "@nook/app-ui";
import { Channel } from "@nook/common/types";
import { FarcasterUserDisplay } from "../../../components/farcaster/users/user-display";
import { FarcasterUserFollowButton } from "../../../components/farcaster/users/user-follow-button";
import { SearchBar } from "../../search/search-bar";
import { ChannelOverview } from "../../../components/farcaster/channels/channel-overview";
import { useUsers } from "../../../hooks/api/users";

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
      <SearchBar channel={channel} />
      <ChannelOverview channel={channel} />
      <ChannelHosts channel={channel} />
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
      backgroundColor="$color1"
      borderColor="$borderColorBg"
      borderWidth="$0.5"
    >
      <NookText variant="label">Hosts</NookText>
      {lead && (
        <XStack alignItems="center" justifyContent="space-between" gap="$4">
          <FarcasterUserDisplay user={lead} asLink />
          <FarcasterUserFollowButton user={lead} />
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
          <FarcasterUserFollowButton user={user} />
        </XStack>
      ))}
    </YStack>
  );
};
