"use client";

import { YStack } from "@nook/app-ui";
import { SearchBar } from "../search/search-bar";
import { RecommendedChannels } from "./recommended-channels";
import { useRecommendedChannels } from "../../api/farcaster";

export const DefaultSidebar = () => {
  const { data } = useRecommendedChannels();
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
      {data?.data && <RecommendedChannels channels={data.data} />}
    </YStack>
  );
};
