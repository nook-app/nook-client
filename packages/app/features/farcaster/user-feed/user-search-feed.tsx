"use client";

import { Loading } from "../../../components/loading";
import { FetchUsersResponse } from "@nook/common/types";
import { FarcasterUserInfiniteFeed } from "./user-feed";
import { useSearchUsers } from "../../../hooks/api/users";

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
  const {
    data,
    isLoading,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refresh,
    isRefetching,
  } = useSearchUsers(q, undefined, initialData);

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
      refetch={refresh}
      isRefetching={isRefetching}
      paddingTop={paddingTop}
      paddingBottom={paddingBottom}
      asTabs={asTabs}
    />
  );
};
