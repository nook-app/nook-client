"use client";

import { View } from "@nook/ui";
import { Display, FarcasterUser, UserFilterType } from "../../../types";
import { FarcasterFilteredFeed } from "../cast-feed/filtered-feed";
import { Tabs } from "../../../components/tabs/tabs";
import { useUser } from "../../../api/farcaster";

export const UserTabs = ({
  user,
  activeTab,
}: { user: FarcasterUser; activeTab: string }) => {
  return (
    <View>
      <Tabs
        tabs={[
          {
            id: "casts",
            label: "Casts",
            href: `/users/${user.username}`,
          },
          {
            id: "replies",
            label: "Replies",
            href: `/users/${user.username}/replies`,
          },
          {
            id: "media",
            label: "Media",
            href: `/users/${user.username}/media`,
          },
          {
            id: "frames",
            label: "Frames",
            href: `/users/${user.username}/frames`,
          },
        ]}
        activeTab={activeTab}
      />
      <UserFeed user={user} activeTab={activeTab} />
    </View>
  );
};

export const UserFeed = ({
  user,
  activeTab,
}: { user: FarcasterUser; activeTab: string }) => {
  switch (activeTab) {
    case "casts":
      return (
        <FarcasterFilteredFeed
          filter={{
            users: { type: UserFilterType.FIDS, data: { fids: [user.fid] } },
          }}
        />
      );
    case "replies":
      return (
        <FarcasterFilteredFeed
          filter={{
            users: { type: UserFilterType.FIDS, data: { fids: [user.fid] } },
            onlyReplies: true,
          }}
        />
      );
    case "media":
      return (
        <FarcasterFilteredFeed
          filter={{
            users: { type: UserFilterType.FIDS, data: { fids: [user.fid] } },
            contentTypes: ["image"],
          }}
          displayMode={Display.GRID}
        />
      );
    case "frames":
      return (
        <FarcasterFilteredFeed
          filter={{
            users: { type: UserFilterType.FIDS, data: { fids: [user.fid] } },
            onlyFrames: true,
          }}
        />
      );
  }
};
