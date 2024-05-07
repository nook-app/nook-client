"use client";

import { useUserFollowers } from "../../../api/farcaster";
import { Loading } from "../../../components/loading";
import { FetchUsersResponse } from "@nook/common/types";
import { FarcasterUserInfiniteFeed } from "../user-feed/user-feed";

export const FarcasterUserFollowers = ({
  username,
  initialData,
}: { username: string; initialData?: FetchUsersResponse }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useUserFollowers(username, initialData);

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
