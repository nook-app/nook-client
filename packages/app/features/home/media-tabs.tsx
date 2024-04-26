"use client";

import { View } from "@nook/ui";
import { Display, Session, UserFilterType } from "../../types";
import { FarcasterFilteredFeed } from "../farcaster/cast-feed/filtered-feed";
import { Tabs } from "../../components/tabs/tabs";

export const MediaAuthenticatedTabs = ({
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
            href: "/media",
          },
          {
            id: "latest",
            label: "Latest",
            href: "/media/latest",
          },
        ]}
        activeTab={activeTab}
      />
      <MediaTabItem session={session} activeTab={activeTab} />
    </View>
  );
};

export const MediaUnauthenticatedTabs = ({
  activeTab,
}: { activeTab: string }) => {
  return (
    <View>
      <Tabs
        tabs={[
          {
            id: "latest",
            label: "Latest",
            href: "/media/latest",
          },
        ]}
        activeTab={activeTab}
      />
      <MediaTabItem activeTab={activeTab} />
    </View>
  );
};

export const MediaTabItem = ({
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
            contentTypes: ["image", "application/x-mpegURL"],
          }}
          displayMode={Display.MEDIA}
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
            contentTypes: ["image", "application/x-mpegURL"],
          }}
          displayMode={Display.MEDIA}
        />
      );
  }
};
