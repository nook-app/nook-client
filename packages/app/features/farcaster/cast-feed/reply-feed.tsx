import { useCastReplies } from "../../../api/farcaster";
import { Loading } from "../../../components/loading";
import { FarcasterInfiniteFeed } from "./infinite-feed";

export const FarcasterReplyFeed = ({ hash }: { hash: string }) => {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useCastReplies(hash, "best");

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
    />
  );
};
