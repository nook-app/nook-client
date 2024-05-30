"use client";

import {
  Display,
  FetchListsResponse,
  GetListsRequest,
} from "@nook/common/types";
import { Loading } from "../../components/loading";
import { useState } from "react";
import { useFollowedLists } from "../../api/list";
import { ListInfiniteFeed } from "./infinite-feed";

export const ListFeed = ({
  filter,
  initialData,
  paddingTop,
  paddingBottom,
  asTabs,
}: {
  filter: GetListsRequest;
  initialData?: FetchListsResponse;
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
  } = useFollowedLists(filter, initialData);

  if (isLoading) {
    return <Loading />;
  }

  const lists = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <ListInfiniteFeed
      lists={lists}
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
