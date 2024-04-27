import { FarcasterFilteredFeed } from "@nook/app/features/farcaster/cast-feed/filtered-feed";
import { FarcasterTrendingFeed } from "@nook/app/features/farcaster/cast-feed/trending-feed";
import { getServerSession } from "@nook/app/server/auth";
import { UserFilterType } from "@nook/app/types";

export default async function Home() {
  const session = await getServerSession();
  if (session) {
    return (
      <FarcasterFilteredFeed
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

  return <FarcasterTrendingFeed />;
}
