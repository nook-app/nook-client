"use client";

import { View } from "@nook/ui";
import { Channel, ChannelFilterType, UserFilterType } from "../../../types";
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
            label: "All",
            href: `/channels/${channel.channelId}/all`,
          },
          {
            label: "From Hosts",
            href: `/channels/${channel.channelId}/from-hosts`,
          },
          {
            label: "Media",
            href: `/channels/${channel.channelId}/media`,
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
  switch (activeIndex) {
    case 0:
      return (
        <FarcasterFilteredFeed
          filter={{
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
          }}
        />
      );
    case 1:
      return (
        <FarcasterFilteredFeed
          filter={{
            channels: {
              type: ChannelFilterType.CHANNEL_URLS,
              data: {
                urls: [channel.url],
              },
            },
          }}
        />
      );
    case 2:
      return (
        <FarcasterFilteredFeed
          filter={{
            users: {
              type: UserFilterType.FIDS,
              data: {
                fids: channel.hostFids || [],
              },
            },
            channels: {
              type: ChannelFilterType.CHANNEL_URLS,
              data: {
                urls: [channel.url],
              },
            },
          }}
        />
      );
    case 3:
      return (
        <FarcasterFilteredFeed
          filter={{
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
            contentTypes: ["image"],
          }}
        />
      );
  }
};
