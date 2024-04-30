"use client";

import { useFarconAttendees } from "../../api/farcon";
import { Loading } from "../../components/loading";
import { FetchUsersResponse } from "../../types";
import { FarcasterUserInfiniteFeed } from "../farcaster/user-feed/user-feed";

export const FarconAttendees = ({
  following,
  initialData,
}: {
  following?: boolean;
  initialData?: FetchUsersResponse;
}) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useFarconAttendees(following, initialData);

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
