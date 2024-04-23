"use client";

import { YStack } from "@nook/ui";
import { SearchBar } from "../../search/search-bar";
import { ChannelOverview } from "../../../components/farcaster/channels/channel-overview";
import { useCast } from "../../../api/farcaster";

export const CastSidebar = ({ hash }: { hash: string }) => {
  const { data: cast } = useCast(hash);
  if (!cast) return null;

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
      {cast.channel && <ChannelOverview channel={cast.channel} asLink />}
    </YStack>
  );
};
