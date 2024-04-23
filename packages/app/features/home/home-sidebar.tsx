"use client";

import { YStack } from "@nook/ui";
import { SearchBar } from "../search/search-bar";

export const HomeSidebar = () => {
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
    </YStack>
  );
};
