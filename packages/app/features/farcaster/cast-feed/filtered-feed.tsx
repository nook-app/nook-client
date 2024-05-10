"use client";

import {
  Display,
  FarcasterFeedFilter,
  FetchCastsResponse,
} from "@nook/common/types";
import { useCastFeed } from "../../../api/farcaster";
import { FarcasterInfiniteFeed } from "./infinite-feed";
import { Loading } from "../../../components/loading";
import { useState } from "react";

export const FarcasterFilteredFeed = ({
  api,
  filter,
  initialData,
  displayMode,
  paddingTop,
  paddingBottom,
  asTabs,
}: {
  api?: string;
  filter: FarcasterFeedFilter;
  initialData?: FetchCastsResponse;
  displayMode?: Display;
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
  } = useCastFeed(filter, api, initialData);

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
      displayMode={displayMode}
      refetch={handleRefresh}
      isRefetching={isRefetching}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      asTabs={asTabs}
    />
  );
};
