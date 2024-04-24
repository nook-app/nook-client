"use client";

import { useCastRecasts } from "../../../api/farcaster/casts";
import { Loading } from "../../../components/loading";
import { FarcasterUserInfiniteFeed } from "../user-feed";

export const FarcasterCastRecasts = ({ hash }: { hash: string }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCastRecasts(hash);

  if (isLoading) {
    return <Loading />;
  }

  const users = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <FarcasterUserInfiniteFeed
      users={users}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
    />
  );
};
