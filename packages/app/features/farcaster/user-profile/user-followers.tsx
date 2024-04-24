"use client";

import { useUserFollowers } from "../../../api/farcaster";
import { Loading } from "../../../components/loading";
import { FarcasterUserInfiniteFeed } from "../user-feed";

export const FarcasterUserFollowers = ({ username }: { username: string }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useUserFollowers(username);

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
