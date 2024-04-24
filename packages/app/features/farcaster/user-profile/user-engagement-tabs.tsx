"use client";

import { View } from "@nook/ui";
import { Tabs } from "../../../components/tabs/tabs";
import { FarcasterUserFollowers } from "./user-followers";
import { FarcasterUserFollowing } from "./user-following";
import { FarcasterUserMutuals } from "./user-mutuals";

export const UserEngagementAuthenticatedTabs = ({
  username,
  activeTab,
}: { username: string; activeTab: string }) => {
  return (
    <View>
      <Tabs
        tabs={[
          {
            id: "mutuals",
            label: "Followers you know",
            href: `/users/${username}/mutuals`,
          },
          {
            id: "followers",
            label: "Followers",
            href: `/users/${username}/followers`,
          },
          {
            id: "following",
            label: "Following",
            href: `/users/${username}/following`,
          },
        ]}
        activeTab={activeTab}
      />
      <UserEngagementTabItem username={username} activeTab={activeTab} />
    </View>
  );
};

export const UserEngagementUnauthenticatedTabs = ({
  username,
  activeTab,
}: { username: string; activeTab: string }) => {
  return (
    <View>
      <Tabs
        tabs={[
          {
            id: "followers",
            label: "Followers",
            href: `/users/${username}/followers`,
          },
          {
            id: "following",
            label: "Following",
            href: `/users/${username}/following`,
          },
        ]}
        activeTab={activeTab}
      />
      <UserEngagementTabItem username={username} activeTab={activeTab} />
    </View>
  );
};

const UserEngagementTabItem = ({
  username,
  activeTab,
}: { username: string; activeTab: string }) => {
  switch (activeTab) {
    case "mutuals":
      return <FarcasterUserMutuals username={username} />;
    case "followers":
      return <FarcasterUserFollowers username={username} />;
    case "following":
      return <FarcasterUserFollowing username={username} />;
  }
};
