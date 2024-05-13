"use client";

import { useCastQuotes } from "../../../api/farcaster/casts";
import { Loading } from "../../../components/loading";
import { FetchCastsResponse } from "@nook/common/types";
import { FarcasterInfiniteFeed } from "../cast-feed/infinite-feed";
import { useState } from "react";

export const FarcasterCastQuotes = ({
  hash,
  initialData,
}: { hash: string; initialData?: FetchCastsResponse }) => {
  const [isRefetching, setIsRefetching] = useState(false);
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useCastQuotes(hash, initialData);

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
    />
  );
};
