"use client";

import { useSearchChannels } from "../../../api/farcaster";
import { Loading } from "../../../components/loading";
import { FetchChannelsResponse } from "@nook/common/types";
import { FarcasterChannelInfiniteFeed } from "./channel-feed";

export const ChannelSearchFeed = ({
  q,
  initialData,
}: { q: string; initialData: FetchChannelsResponse }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSearchChannels(q, undefined, initialData);

  if (isLoading) {
    return <Loading />;
  }

  const channels = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <FarcasterChannelInfiniteFeed
      channels={channels}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
    />
  );
};
