"use client";

import { useTrendingCasts } from "../../../api/farcaster";
import { Loading } from "../../../components/loading";
import { FarcasterInfiniteFeed } from "./infinite-feed";
import { FetchCastsResponse } from "@nook/common/types";
import { useState } from "react";

export const FarcasterTrendingFeed = ({
  viewerFid,
  initialData,
  paddingTop,
  paddingBottom,
}: {
  viewerFid?: string;
  initialData?: FetchCastsResponse;
  paddingTop?: number;
  paddingBottom?: number;
}) => {
  const [isRefetching, setIsRefetching] = useState(false);
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useTrendingCasts(viewerFid, initialData);

  if (isLoading) {
    return <Loading />;
  }

  const casts = data?.pages.flatMap((page) => page.data) ?? [];

  const handleRefresh = async () => {
    setIsRefetching(true);
    await refetch();
    setIsRefetching(false);
  };

  return (
    <FarcasterInfiniteFeed
      casts={casts}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      refetch={handleRefresh}
      isRefetching={isRefetching}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
    />
  );
};
