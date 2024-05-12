"use client";

import { useSearchChannels } from "../../../api/farcaster";
import { Loading } from "../../../components/loading";
import { FetchChannelsResponse } from "@nook/common/types";
import { FarcasterChannelInfiniteFeed } from "./channel-feed";
import { useState } from "react";

export const ChannelSearchFeed = ({
  q,
  initialData,
  paddingTop,
  paddingBottom,
  asTabs,
}: {
  q: string;
  initialData?: FetchChannelsResponse;
  paddingTop?: number;
  paddingBottom?: number;
  asTabs?: boolean;
}) => {
  const [isRefetching, setIsRefetching] = useState(false);
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useSearchChannels(q, undefined, initialData);

  if (isLoading) {
    return <Loading />;
  }

  const channels = data?.pages.flatMap((page) => page.data) ?? [];

  const handleRefresh = async () => {
    setIsRefetching(true);
    await refetch();
    setIsRefetching(false);
  };

  return (
    <FarcasterChannelInfiniteFeed
      channels={channels}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      refetch={handleRefresh}
      isRefetching={isRefetching}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      asTabs={asTabs}
    />
  );
};
