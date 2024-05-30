"use client";

import { useSearchChannels } from "../../../hooks/api/channels";
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
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refresh,
    isRefetching,
  } = useSearchChannels(q, undefined, initialData);

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
      refetch={refresh}
      isRefetching={isRefetching}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      asTabs={asTabs}
    />
  );
};
