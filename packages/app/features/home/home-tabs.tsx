"use client";

import { View } from "@nook/ui";
import { Session, UserFilterType } from "../../types";
import { FarcasterFilteredFeed } from "../farcaster/cast-feed/filtered-feed";
import { Tabs } from "../../components/tabs/tabs";
import { FarcasterTrendingFeed } from "../farcaster/cast-feed/trending-feed";

export const HomeAuthenticatedTabs = ({
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
            href: "/",
          },
          {
            id: "trending",
            label: "Trending",
            href: "/trending",
          },
          {
            id: "latest",
            label: "Latest",
            href: "/latest",
          },
        ]}
        activeTab={activeTab}
      />
      <HomeTabItem session={session} activeTab={activeTab} />
    </View>
  );
};

export const HomeUnauthenticatedTabs = ({
  activeTab,
}: { activeTab: string }) => {
  return (
    <View>
      <Tabs
        tabs={[
          {
            id: "trending",
            label: "Trending",
            href: "/trending",
          },
          {
            id: "latest",
            label: "Latest",
            href: "/latest",
          },
        ]}
        activeTab={activeTab}
      />
      <HomeTabItem activeTab={activeTab} />
    </View>
  );
};

export const HomeTabItem = ({
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
          }}
        />
      );
    case "trending":
      return <FarcasterTrendingFeed viewerFid={session?.fid} />;
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
          }}
        />
      );
  }
};
