"use client";

import { useEffect, useState } from "react";
import { useTrendingCasts } from "../../../api/farcaster";
import { Loading } from "../../../components/loading";
import { FarcasterInfiniteFeed } from "./infinite-feed";
import { FarcasterCast, FetchCastsResponse } from "../../../types";
import { useUserStore } from "../../../store/useUserStore";
import { useCastStore } from "../../../store/useCastStore";

export const FarcasterTrendingFeed = ({
  viewerFid,
  initialData,
}: { viewerFid?: string; initialData?: FetchCastsResponse }) => {
  const [casts, setCasts] = useState<FarcasterCast[]>([]);
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useTrendingCasts(viewerFid, initialData);

  const addUsers = useUserStore((state) => state.addUsers);
  const addCasts = useCastStore((state) => state.addCasts);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    setCasts(data?.pages.flatMap((page) => page.data) ?? []);
    const lastPage = data?.pages[data.pages.length - 1];
    if (lastPage) {
      const users = lastPage.data.map((cast) => cast.user);
      addUsers(users);
      addCasts(lastPage.data);
    }
  }, [data]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <FarcasterInfiniteFeed
      casts={casts}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
    />
  );
};