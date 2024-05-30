"use client";

import { Loading } from "../../../components/loading";
import { FetchUsersResponse } from "@nook/common/types";
import { FarcasterUserInfiniteFeed } from "../user-feed/user-feed";
import { useUserFollowers } from "../../../hooks/api/users";

export const FarcasterUserFollowers = ({
  fid,
  initialData,
  asTabs,
}: {
  fid: string;
  initialData?: FetchUsersResponse;
  asTabs?: boolean;
}) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useUserFollowers(fid, initialData);

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
      asTabs={asTabs}
    />
  );
};
