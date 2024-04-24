"use client";

import { View } from "@nook/ui";
import { Tabs } from "../../../components/tabs/tabs";
import { FarcasterUserFollowers } from "./user-followers";
import { FarcasterUserFollowing } from "./user-following";

export const UserEngagementTabs = ({
  username,
  activeIndex,
}: { username: string; activeIndex: number }) => {
  return (
    <View>
      <Tabs
        tabs={[
          {
            label: "Followers",
            href: `/users/${username}/followers`,
          },
          {
            label: "Following",
            href: `/users/${username}/following`,
          },
        ]}
        activeIndex={activeIndex}
      />
      <UserEngagementTab username={username} activeIndex={activeIndex} />
    </View>
  );
};

export const UserEngagementTab = ({
  username,
  activeIndex,
}: { username: string; activeIndex: number }) => {
  switch (activeIndex) {
    case 0:
      return <FarcasterUserFollowers username={username} />;
    case 1:
      return <FarcasterUserFollowing username={username} />;
  }
};
