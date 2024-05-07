"use client";

import { YStack } from "@nook/ui";
import { SearchBar } from "../search/search-bar";
import { Channel } from "@nook/common/types";
import { RecommendedChannels } from "../home/recommended-channels";

export const ExploreSidebar = ({ channels }: { channels: Channel[] }) => {
  return (
    <YStack
      padding="$3"
      gap="$3"
      top={0}
      $platform-web={{
        position: "sticky",
      }}
    >
      <SearchBar />
      <RecommendedChannels channels={channels} />
    </YStack>
  );
};
