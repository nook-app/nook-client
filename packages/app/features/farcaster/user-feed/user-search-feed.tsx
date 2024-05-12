"use client";

import { useSearchUsers } from "../../../api/farcaster";
import { Loading } from "../../../components/loading";
import { FetchUsersResponse } from "@nook/common/types";
import { FarcasterUserInfiniteFeed } from "./user-feed";
import { useState } from "react";

export const UserSearchFeed = ({
  q,
  initialData,
  paddingTop,
  paddingBottom,
  asTabs,
}: {
  q: string;
  initialData?: FetchUsersResponse;
  paddingTop?: number;
  paddingBottom?: number;
  asTabs?: boolean;
}) => {
  const [isRefetching, setIsRefetching] = useState(false);
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
  } = useSearchUsers(q, undefined, initialData);

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
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      asTabs={asTabs}
    />
  );
};
