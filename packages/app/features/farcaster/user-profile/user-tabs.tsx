"use client";

import { View } from "@nook/ui";
import { Display, FarcasterUser, UserFilterType } from "../../../types";
import { FarcasterFilteredFeed } from "../cast-feed/filtered-feed";
import { Tabs } from "../../../components/tabs/tabs";
import { useUser } from "../../../api/farcaster";

export const UserTabs = ({
  username,
  activeIndex,
}: { username: string; activeIndex: number }) => {
  const { data: user } = useUser(username);
  if (!user) return null;

  return (
    <View>
      <Tabs
        tabs={[
          {
            label: "Casts",
            href: `/users/${user.username}`,
          },
          {
            label: "Replies",
            href: `/users/${user.username}/replies`,
          },
          {
            label: "Media",
            href: `/users/${user.username}/media`,
          },
          {
            label: "Frames",
            href: `/users/${user.username}/frames`,
          },
        ]}
        activeIndex={activeIndex}
      />
      <UserFeed user={user} activeIndex={activeIndex} />
    </View>
  );
};

export const UserFeed = ({
  user,
  activeIndex,
}: { user: FarcasterUser; activeIndex: number }) => {
  switch (activeIndex) {
    case 0:
      return (
        <FarcasterFilteredFeed
          filter={{
            users: { type: UserFilterType.FIDS, data: { fids: [user.fid] } },
          }}
        />
      );
    case 1:
      return (
        <FarcasterFilteredFeed
          filter={{
            users: { type: UserFilterType.FIDS, data: { fids: [user.fid] } },
            onlyReplies: true,
          }}
        />
      );
    case 2:
      return (
        <FarcasterFilteredFeed
          filter={{
            users: { type: UserFilterType.FIDS, data: { fids: [user.fid] } },
            contentTypes: ["image"],
          }}
          displayMode={Display.GRID}
        />
      );
    case 3:
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
