import { FarcasterFilteredFeedServer } from "@nook/app/features/farcaster/cast-feed/filtered-feed-server";
import { FarcasterTrendingFeed } from "@nook/app/features/farcaster/cast-feed/trending-feed";
import { getServerSession } from "@nook/app/server/auth";
import { fetchTrendingCasts } from "@nook/app/server/feed";
import { UserFilterType } from "@nook/app/types";

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
