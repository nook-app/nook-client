"use client";

import { YStack } from "@nook/ui";
import { SearchBar } from "../../search/search-bar";
import { ChannelOverview } from "../../../components/farcaster/channels/channel-overview";
import { FarcasterCast } from "@nook/common/types";

export const CastSidebar = ({ cast }: { cast: FarcasterCast }) => {
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
      {cast?.channel && <ChannelOverview channel={cast.channel} asLink />}
    </YStack>
  );
};
