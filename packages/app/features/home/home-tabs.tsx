"use client";

import { View } from "@nook/ui";
import { UserFilterType } from "../../types";
import { FarcasterFilteredFeed } from "../farcaster/cast-feed/filtered-feed";
import { Tabs } from "../../components/tabs/tabs";
import { useAuth } from "../../context/auth";
import { FarcasterTrendingFeed } from "../farcaster/cast-feed/trending-feed";

export const HomeTabs = ({ activeIndex }: { activeIndex: number }) => {
  const { session } = useAuth();

  const tabs = session?.fid
    ? [
        {
          label: "Following",
          href: "/",
        },
        {
          label: "Trending",
          href: "/trending",
        },
        {
          label: "Latest",
          href: "/latest",
        },
      ]
    : [
        {
          label: "Trending",
          href: "/",
        },
        {
          label: "Latest",
          href: "/latest",
        },
      ];

  return (
    <View>
      <Tabs
        tabs={tabs}
        activeIndex={
          activeIndex > 0 && !session?.fid ? activeIndex - 1 : activeIndex
        }
      />
      {session?.fid ? (
        <HomeAuthenticatedFeed activeIndex={activeIndex} />
      ) : (
        <HomeUnauthenticatedFeed
          activeIndex={
            activeIndex > 0 && !session?.fid ? activeIndex - 1 : activeIndex
          }
        />
      )}
    </View>
  );
};

export const HomeAuthenticatedFeed = ({
  activeIndex,
}: { activeIndex: number }) => {
  const { session } = useAuth();
  switch (activeIndex) {
    case 0:
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
    case 1:
      return <FarcasterTrendingFeed viewerFid={session?.fid} />;
    case 2:
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

export const HomeUnauthenticatedFeed = ({
  activeIndex,
}: { activeIndex: number }) => {
  switch (activeIndex) {
    case 0:
      return <FarcasterTrendingFeed />;
    case 1:
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
