"use client";

import { View } from "@nook/ui";
import {
  FarcasterFeedFilter,
  FarcasterUser,
  UserFilterType,
} from "../../../types";
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
  let filter: FarcasterFeedFilter = {};
  switch (activeIndex) {
    case 0:
      filter = {
        users: {
          type: UserFilterType.FIDS,
          data: {
            fids: [user.fid],
          },
        },
      };
      break;
    case 1:
      filter = {
        users: {
          type: UserFilterType.FIDS,
          data: {
            fids: [user.fid],
          },
        },
        onlyReplies: true,
      };
      break;
    case 2:
      filter = {
        users: {
          type: UserFilterType.FIDS,
          data: {
            fids: [user.fid],
          },
        },
        contentTypes: ["image", "video"],
      };
      break;
    case 3:
      filter = {
        users: {
          type: UserFilterType.FIDS,
          data: {
            fids: [user.fid],
          },
        },
        onlyFrames: true,
      };
      break;
  }
  return <FarcasterFilteredFeed filter={filter} />;
};
