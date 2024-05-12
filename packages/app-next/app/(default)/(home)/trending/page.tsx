import { getServerSession } from "@nook/app/server/session";
import { FarcasterFilteredFeedServer } from "@nook/app/features/farcaster/cast-feed/filtered-feed-server";

export default async function Home() {
  const session = await getServerSession();
  if (!session) return null;
  return (
    <FarcasterFilteredFeedServer
      api="https://api.neynar.com/v2/farcaster/feed/trending"
      filter={{}}
    />
  );
}
