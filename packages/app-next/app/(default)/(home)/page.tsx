import { fetchTrendingCasts } from "@nook/app/api/farcaster";
import { FarcasterFilteredFeedServer } from "@nook/app/features/farcaster/cast-feed/filtered-feed-server";
import { FarcasterTrendingFeed } from "@nook/app/features/farcaster/cast-feed/trending-feed";
import { getServerSession } from "@nook/app/server/session";
import { UserFilterType } from "@nook/common/types";

export default async function Home() {
  const session = await getServerSession();

  if (session) {
    return (
      <FarcasterFilteredFeedServer
        filter={{
          users: {
            type: UserFilterType.FOLLOWING,
            data: {
              fid: session?.fid,
            },
          },
        }}
      />
    );
  }

  const trendingFeed = await fetchTrendingCasts();
  return <FarcasterTrendingFeed initialData={trendingFeed} />;
}
