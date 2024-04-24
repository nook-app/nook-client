"use client";

import { View } from "@nook/ui";
import { Tabs } from "../../../components/tabs/tabs";
import { FarcasterCastQuotes } from "./cast-quotes";
import { FarcasterCastRecasts } from "./cast-recasts";
import { FarcasterCastLikes } from "./cast-likes";

export const CastEngagementTabs = ({
  hash,
  activeIndex,
}: { hash: string; activeIndex: number }) => {
  return (
    <View>
      <Tabs
        tabs={[
          {
            label: "Quotes",
            href: `/casts/${hash}/quotes`,
          },
          {
            label: "Recasts",
            href: `/casts/${hash}/recasts`,
          },
          {
            label: "Likes",
            href: `/casts/${hash}/likes`,
          },
        ]}
        activeIndex={activeIndex}
      />
      <CastEngagementTab hash={hash} activeIndex={activeIndex} />
    </View>
  );
};

export const CastEngagementTab = ({
  hash,
  activeIndex,
}: { hash: string; activeIndex: number }) => {
  switch (activeIndex) {
    case 0:
      return <FarcasterCastQuotes hash={hash} />;
    case 1:
      return <FarcasterCastRecasts hash={hash} />;
    case 2:
      return <FarcasterCastLikes hash={hash} />;
  }
};
