"use client";

import {
  Display,
  FarcasterFeedFilter,
  FetchCastsResponse,
} from "@nook/common/types";
import { FarcasterInfiniteFeed } from "./infinite-feed";
import { Loading } from "../../../components/loading";
import { memo } from "react";
import { useCastFeed } from "../../../hooks/api/feed";

export const FarcasterFilteredFeed = memo(
  ({
    api,
    filter,
    initialData,
    displayMode,
    paddingTop,
    paddingBottom,
    asTabs,
  }: {
    api?: string;
    filter: FarcasterFeedFilter;
    initialData?: FetchCastsResponse;
    displayMode?: Display;
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
    } = useCastFeed(filter, api, initialData);

    if (isLoading) {
      return <Loading />;
    }

    const casts = data?.pages.flatMap((page) => page.data) ?? [];

    return (
      <FarcasterInfiniteFeed
        casts={casts}
        fetchNextPage={fetchNextPage}
        isFetchingNextPage={isFetchingNextPage}
        hasNextPage={hasNextPage}
        displayMode={displayMode}
        refetch={refresh}
        isRefetching={isRefetching}
        paddingTop={paddingTop}
        paddingBottom={paddingBottom}
        asTabs={asTabs}
      />
    );
  },
);
