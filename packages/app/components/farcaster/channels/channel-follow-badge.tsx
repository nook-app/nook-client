"use client";

import { NookText, View } from "@nook/app-ui";
import { Channel } from "@nook/common/types";
import { useChannelFollowingStatus } from "../../../api/warpcast";
import { useAuth } from "../../../context/auth";

export const ChannelFollowBadge = ({ channel }: { channel: Channel }) => {
  const { session } = useAuth();
  const { data } = useChannelFollowingStatus(channel.channelId, session?.fid);

  if (!data?.result?.following) return null;

  return (
    <View
      paddingVertical="$1"
      paddingHorizontal="$2"
      borderRadius="$2"
      backgroundColor="$color5"
    >
      <NookText fontSize="$2" fontWeight="500">
        Following
      </NookText>
    </View>
  );
};
