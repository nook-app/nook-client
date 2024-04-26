import { useTrendingCasts } from "../../../api/farcaster";
import { Loading } from "../../../components/loading";
import { FarcasterInfiniteFeed } from "./infinite-feed";

export const FarcasterTrendingFeed = ({
  viewerFid,
}: { viewerFid?: string }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useTrendingCasts(viewerFid);

  if (isLoading) {
    return <Loading />;
  }

  const casts = data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <FarcasterInfiniteFeed
      queryKey={["trending"]}
      casts={casts}
      fetchNextPage={fetchNextPage}
      isFetchingNextPage={isFetchingNextPage}
      hasNextPage={hasNextPage}
    />
  );
};
