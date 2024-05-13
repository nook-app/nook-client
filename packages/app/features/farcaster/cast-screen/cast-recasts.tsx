"use client";

import { useCastRecasts } from "../../../api/farcaster/casts";
import { Loading } from "../../../components/loading";
import { FetchUsersResponse } from "@nook/common/types";
import { FarcasterUserInfiniteFeed } from "../user-feed/user-feed";
import { useState } from "react";

export const FarcasterCastRecasts = ({
  hash,
  initialData,
}: { hash: string; initialData?: FetchUsersResponse }) => {
  const [isRefetching, setIsRefetching] = useState(false);
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useCastRecasts(hash, initialData);

  if (isLoading) {
    return <Loading />;
  }

  const users = data?.pages.flatMap((page) => page.data) ?? [];

  const handleRefresh = async () => {
    setIsRefetching(true);
    await refetch();
    setIsRefetching(false);
  };

  return (
    <FarcasterUserInfiniteFeed
      users={users}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      refetch={handleRefresh}
      isRefetching={isRefetching}
    />
  );
};
