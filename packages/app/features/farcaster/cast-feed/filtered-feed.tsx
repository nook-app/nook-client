"use client";

import { Display, FarcasterCast, FarcasterFeedFilter } from "../../../types";
import { useCastFeed } from "../../../api/farcaster";
import { FarcasterInfiniteFeed } from "./infinite-feed";
import { Loading } from "../../../components/loading";
import { useAuth } from "../../../context/auth";
import { useEffect, useState } from "react";
import { useUserStore } from "../../../store/useUserStore";
import { useCastStore } from "../../../store/useCastStore";

export const FarcasterFilteredFeed = ({
  filter,
  displayMode,
}: { filter: FarcasterFeedFilter; displayMode?: Display }) => {
  const { session } = useAuth();
  const [casts, setCasts] = useState<FarcasterCast[]>([]);
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCastFeed(filter, {
      viewerFid: session?.fid,
    });

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
      queryKey={["castFeed", JSON.stringify(filter)]}
      casts={casts}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
      displayMode={displayMode}
    />
  );
};
