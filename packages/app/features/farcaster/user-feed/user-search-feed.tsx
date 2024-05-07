"use client";

import { useSearchUsers } from "../../../api/farcaster";
import { Loading } from "../../../components/loading";
import { FetchUsersResponse } from "@nook/common/types";
import { FarcasterUserInfiniteFeed } from "./user-feed";

export const UserSearchFeed = ({
  q,
  initialData,
}: { q: string; initialData?: FetchUsersResponse }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSearchUsers(q, undefined, initialData);

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
