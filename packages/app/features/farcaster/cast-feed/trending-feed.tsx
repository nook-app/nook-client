"use client";

import { useTrendingCasts } from "../../../api/farcaster";
import { Loading } from "../../../components/loading";
import { FarcasterInfiniteFeed } from "./infinite-feed";
import { FetchCastsResponse } from "../../../types";

export const FarcasterTrendingFeed = ({
  viewerFid,
  initialData,
}: { viewerFid?: string; initialData?: FetchCastsResponse }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useTrendingCasts(viewerFid, initialData);

  if (isLoading) {
    return <Loading />;
  }

  const casts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <FarcasterInfiniteFeed
      casts={casts}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
    />
  );
};
