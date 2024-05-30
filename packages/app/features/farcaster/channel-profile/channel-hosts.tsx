"use client";

import { FarcasterUserInfiniteFeed } from "../user-feed/user-feed";
import { useUsers } from "../../../hooks/api/users";
import { useChannel } from "../../../hooks/useChannel";

export const FarcasterChannelHosts = ({
  channelId,
}: {
  channelId: string;
}) => {
  const { channel } = useChannel(channelId);

  const fids = [];
  if (channel?.creatorId) {
    fids.push(channel.creatorId);
  }
  if (channel?.hostFids) {
    fids.push(...channel.hostFids);
  }

  const { data } = useUsers(Array.from(new Set(fids)).sort());

  return (
    <FarcasterUserInfiniteFeed
      users={data?.data ?? []}
      fetchNextPage={() => {}}
      isFetchingNextPage={false}
      hasNextPage={false}
    />
  );
};
