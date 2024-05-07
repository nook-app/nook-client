"use client";

import { View } from "@nook/app-ui";
import { Tabs } from "../../../components/tabs/tabs";
import { FarcasterCastLikes } from "./cast-quotes";
import { FarcasterCastLikes } from "./cast-recasts";
import { FarcasterCastLikes } from "./cast-likes";

export const CastEngagementTabs = ({
  hash,
  activeTab,
}: { hash: string; activeTab: string }) => {
  return (
    <View>
      <Tabs
        tabs={[
          {
            id: "quotes",
            label: "Quotes",
            href: `/casts/${hash}/quotes`,
          },
          {
            id: "recasts",
            label: "Recasts",
            href: `/casts/${hash}/recasts`,
          },
          {
            id: "likes",
            label: "Likes",
            href: `/casts/${hash}/likes`,
          },
        ]}
        activeTab={activeTab}
      />
      <CastEngagementTab hash={hash} activeTab={activeTab} />
    </View>
  );
};

export const CastEngagementTab = ({
  hash,
  activeTab,
}: { hash: string; activeTab: string }) => {
  switch (activeTab) {
    case "quotes":
      return <FarcasterCastLikes hash={hash} />;
    case "recasts":
      return <FarcasterCastLikes hash={hash} />;
    case "likes":
      return <FarcasterCastLikes hash={hash} />;
  }
};
