"use client";

import {
  Display,
  FarcasterFeedFilter,
  FetchCastsResponse,
} from "../../../types";
import { useCastFeed } from "../../../api/farcaster";
import { FarcasterInfiniteFeed } from "./infinite-feed";
import { Loading } from "../../../components/loading";

export const FarcasterFilteredFeed = ({
  api,
  filter,
  initialData,
  displayMode,
}: {
  api?: string;
  filter: FarcasterFeedFilter;
  initialData?: FetchCastsResponse;
  displayMode?: Display;
}) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCastFeed(filter, api, initialData);

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
      displayMode={displayMode}
    />
  );
};
