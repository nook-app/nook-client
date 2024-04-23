"use client";

import { YStack } from "@nook/ui";
import { FarcasterUser } from "../../../types";
import { SearchBar } from "../../search/search-bar";

export const UserSidebar = ({ user }: { user: FarcasterUser }) => {
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
