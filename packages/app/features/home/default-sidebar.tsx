"use client";

import { YStack } from "@nook/app-ui";
import { SearchBar } from "../search/search-bar";
import { Channel } from "@nook/common/types";
import { RecommendedChannels } from "./recommended-channels";

export const DefaultSidebar = ({ channels }: { channels?: Channel[] }) => {
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
      {channels && <RecommendedChannels channels={channels} />}
    </YStack>
  );
};
