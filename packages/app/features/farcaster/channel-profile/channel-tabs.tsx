"use client";

import { NookText, View, XStack } from "@nook/ui";
import {
  Channel,
  ChannelFilterType,
  FarcasterFeedFilter,
  UserFilterType,
} from "../../../types";
import { ReactNode } from "react";
import { Link } from "solito/link";
import { FarcasterCastFeed } from "../cast-feed";

export type ChannelTabs = "latest" | "media";

export const ChannelTabs = ({
  channel,
  activeTab,
}: { channel: Channel; activeTab: ChannelTabs }) => {
  return (
    <View>
      <XStack
        flexGrow={1}
        justifyContent="space-around"
        alignItems="center"
        borderBottomWidth="$0.5"
        borderBottomColor="$color5"
      >
        <ChannelTab
          href={`/channels/${channel.channelId}`}
          isActive={activeTab === "latest"}
        >
          Latest
        </ChannelTab>
        <ChannelTab
          href={`/channels/${channel.channelId}/media`}
          isActive={activeTab === "media"}
        >
          Media
        </ChannelTab>
      </XStack>
      <ChannelFeed channel={channel} activeTab={activeTab} />
    </View>
  );
};

const ChannelTab = ({
  children,
  href,
  isActive,
}: { children: ReactNode; href: string; isActive: boolean }) => {
  return (
    <Link
      href={href}
      viewProps={{
        style: {
          flex: 1,
          flexGrow: 1,
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
      }}
    >
      <View paddingHorizontal="$2" paddingVertical="$4">
        <NookText fontWeight={isActive ? "700" : "500"} muted={!isActive}>
          {children}
        </NookText>
        <View
          position="absolute"
          bottom={0}
          left={0}
          width="100%"
          height="$0.5"
          borderRadius="$4"
          backgroundColor={isActive ? "$color11" : "transparent"}
        />
      </View>
    </Link>
  );
};

export const ChannelFeed = ({
  channel,
  activeTab,
}: { channel: Channel; activeTab: ChannelTabs }) => {
  let filter: FarcasterFeedFilter = {};
  switch (activeTab) {
    case "latest":
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
    case "media":
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
  }
  return <FarcasterCastFeed filter={filter} />;
};
