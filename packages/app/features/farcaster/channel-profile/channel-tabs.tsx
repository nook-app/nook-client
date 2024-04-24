"use client";

import { View } from "@nook/ui";
import { Channel, ChannelFilterType, UserFilterType } from "../../../types";
import { FarcasterFilteredFeed } from "../cast-feed/filtered-feed";
import { Tabs } from "../../../components/tabs/tabs";
import { useChannel } from "../../../api/farcaster";

export const ChannelTabs = ({
  channelId,
  activeTab,
}: { channelId: string; activeTab: string }) => {
  const { data: channel } = useChannel(channelId);
  if (!channel) return null;

  return (
    <View>
      <Tabs
        tabs={[
          {
            id: "relevant",
            label: "Relevant",
            href: `/channels/${channel.channelId}`,
          },
          {
            id: "all",
            label: "All",
            href: `/channels/${channel.channelId}/all`,
          },
          {
            id: "from-hosts",
            label: "From Hosts",
            href: `/channels/${channel.channelId}/from-hosts`,
          },
          {
            id: "media",
            label: "Media",
            href: `/channels/${channel.channelId}/media`,
          },
        ]}
        activeTab={activeTab}
      />
      <ChannelFeed channel={channel} activeTab={activeTab} />
    </View>
  );
};

export const ChannelFeed = ({
  channel,
  activeTab,
}: { channel: Channel; activeTab: string }) => {
  switch (activeTab) {
    case "relevant":
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
    case "all":
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
    case "from-hosts":
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
    case "media":
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
