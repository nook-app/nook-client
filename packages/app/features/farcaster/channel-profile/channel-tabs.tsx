"use client";

import { View } from "@nook/ui";
import {
  Channel,
  ChannelFilterType,
  FarcasterFeedFilter,
  UserFilterType,
} from "../../../types";
import { FarcasterFilteredFeed } from "../cast-feed/filtered-feed";
import { Tabs } from "../../../components/tabs/tabs";
import { useChannel } from "../../../api/farcaster";

export const ChannelTabs = ({
  channelId,
  activeIndex,
}: { channelId: string; activeIndex: number }) => {
  const { data: channel } = useChannel(channelId);
  if (!channel) return null;

  return (
    <View>
      <Tabs
        tabs={[
          {
            label: "Relevant",
            href: `/channels/${channel.channelId}`,
          },
          {
            label: "Media",
            href: `/channels/${channel.channelId}/media`,
          },
          {
            label: "Recent",
            href: `/channels/${channel.channelId}/all`,
          },
        ]}
        activeIndex={activeIndex}
      />
      <ChannelFeed channel={channel} activeIndex={activeIndex} />
    </View>
  );
};

export const ChannelFeed = ({
  channel,
  activeIndex,
}: { channel: Channel; activeIndex: number }) => {
  let filter: FarcasterFeedFilter = {};
  switch (activeIndex) {
    case 0:
      filter = {
        users: {
          type: UserFilterType.POWER_BADGE,
          data: {
            badge: true,
          },
        },
        channels: {
          type: ChannelFilterType.CHANNEL_URLS,
          data: {
            urls: [channel.url],
          },
        },
      };
      break;
    case 1:
      filter = {
        users: {
          type: UserFilterType.POWER_BADGE,
          data: {
            badge: true,
          },
        },
        channels: {
          type: ChannelFilterType.CHANNEL_URLS,
          data: {
            urls: [channel.url],
          },
        },
        contentTypes: ["image", "video"],
      };
      break;
    case 2:
      filter = {
        channels: {
          type: ChannelFilterType.CHANNEL_URLS,
          data: {
            urls: [channel.url],
          },
        },
      };
      break;
  }
  return <FarcasterFilteredFeed filter={filter} />;
};
