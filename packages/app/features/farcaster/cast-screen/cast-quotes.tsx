"use client";

import { useCastQuotes } from "../../../api/farcaster/casts";
import { Loading } from "../../../components/loading";
import { FetchCastsResponse } from "../../../types";
import { FarcasterInfiniteFeed } from "../cast-feed/infinite-feed";

export const FarcasterCastQuotes = ({
  hash,
  initialData,
}: { hash: string; initialData?: FetchCastsResponse }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCastQuotes(hash, initialData);

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
