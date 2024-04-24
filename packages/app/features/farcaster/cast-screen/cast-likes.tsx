"use client";

import { useCastLikes } from "../../../api/farcaster/casts";
import { Loading } from "../../../components/loading";
import { FarcasterUserInfiniteFeed } from "../user-feed";

export const FarcasterCastLikes = ({ hash }: { hash: string }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCastLikes(hash);

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
