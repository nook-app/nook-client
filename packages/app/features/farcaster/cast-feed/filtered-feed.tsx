import { Display, FarcasterFeedFilter } from "../../../types";
import { useCastFeed } from "../../../api/farcaster";
import { FarcasterInfiniteFeed } from "./infinite-feed";
import { Loading } from "../../../components/loading";
import { useAuth } from "../../../context/auth";

export const FarcasterFilteredFeed = ({
  filter,
  displayMode,
}: { filter: FarcasterFeedFilter; displayMode?: Display }) => {
  const { session } = useAuth();
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCastFeed(filter, {
      viewerFid: session?.fid,
    });

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
    />
  );
};
