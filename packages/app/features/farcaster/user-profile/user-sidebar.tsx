"use client";

import { YStack } from "@nook/ui";
import { SearchBar } from "../../search/search-bar";
import { useUser } from "../../../api/farcaster";

export const UserSidebar = ({ username }: { username: string }) => {
  const { data: user } = useUser(username);
  if (!user) return null;

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
