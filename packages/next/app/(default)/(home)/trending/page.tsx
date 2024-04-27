import { FarcasterTrendingFeed } from "@nook/app/features/farcaster/cast-feed/trending-feed";
import { getServerSession } from "@nook/app/server/auth";

export default async function Home() {
  const session = await getServerSession();
  return <FarcasterTrendingFeed viewerFid={session?.fid} />;
}
