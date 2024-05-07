"use client";

import { useCastRecasts } from "../../../api/farcaster/casts";
import { Loading } from "../../../components/loading";
import { FetchUsersResponse } from "@nook/common/types";
import { FarcasterUserInfiniteFeed } from "../user-feed/user-feed";

export const FarcasterCastRecasts = ({
  hash,
  initialData,
}: { hash: string; initialData?: FetchUsersResponse }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCastRecasts(hash, initialData);

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
