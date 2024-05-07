"use client";

import { FetchCatActionsResponse } from "@nook/common/types";
import { useFarcasterActions } from "../../api/warpcast";
import { FarcasterActionsFeed } from "./actions-feed";
import { Loading } from "../../components/loading";

export const ExploreActions = ({
  initialData,
}: { initialData: FetchCatActionsResponse }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useFarcasterActions(initialData);

  if (isLoading) {
    return <Loading />;
  }

  const actions = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <FarcasterActionsFeed
      actions={actions}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
    />
  );
};
