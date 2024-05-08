import { FarcasterTrendingFeed } from "@nook/app/features/farcaster/cast-feed/trending-feed";
import { getServerSession } from "@nook/app/server/session";
import { fetchTrendingCasts } from "@nook/app/server/feed";

export default async function Home() {
  const [session, trendingFeed] = await Promise.all([
    getServerSession(),
    fetchTrendingCasts(),
  ]);
  return (
    <FarcasterTrendingFeed
      viewerFid={session?.fid}
      initialData={trendingFeed}
    />
  );
}
