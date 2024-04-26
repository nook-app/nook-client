"use client";

import { View } from "@nook/ui";
import { Display, Session, UserFilterType } from "../../types";
import { FarcasterFilteredFeed } from "../farcaster/cast-feed/filtered-feed";
import { Tabs } from "../../components/tabs/tabs";

export const FrameAuthenticatedTabs = ({
  session,
  activeTab,
}: { session?: Session; activeTab: string }) => {
  return (
    <View>
      <Tabs
        tabs={[
          {
            id: "following",
            label: "Following",
            href: "/frames",
          },
          {
            id: "latest",
            label: "Latest",
            href: "/frames/latest",
          },
        ]}
        activeTab={activeTab}
      />
      <FrameTabItem session={session} activeTab={activeTab} />
    </View>
  );
};

export const FrameUnauthenticatedTabs = ({
  activeTab,
}: { activeTab: string }) => {
  return (
    <View>
      <Tabs
        tabs={[
          {
            id: "latest",
            label: "Latest",
            href: "/frames/latest",
          },
        ]}
        activeTab={activeTab}
      />
      <FrameTabItem activeTab={activeTab} />
    </View>
  );
};

export const FrameTabItem = ({
  session,
  activeTab,
}: { session?: Session; activeTab: string }) => {
  switch (activeTab) {
    case "following":
      if (!session?.fid) return null;
      return (
        <FarcasterFilteredFeed
          filter={{
            users: {
              type: UserFilterType.FOLLOWING,
              data: {
                fid: session?.fid,
              },
            },
            onlyFrames: true,
          }}
          displayMode={Display.FRAMES}
        />
      );
    case "latest":
      return (
        <FarcasterFilteredFeed
          filter={{
            users: {
              type: UserFilterType.POWER_BADGE,
              data: {
                badge: true,
              },
            },
            onlyFrames: true,
          }}
          displayMode={Display.FRAMES}
        />
      );
  }
};
