import { FarcasterFilteredFeedServer } from "@nook/app/features/farcaster/cast-feed/filtered-feed-server";
import { FarcasterTrendingFeed } from "@nook/app/features/farcaster/cast-feed/trending-feed";
import { getServerSession } from "@nook/app/server/auth";
import { fetchTrendingCasts } from "@nook/app/server/feed";
import { UserFilterType } from "@nook/app/types";
import { FARCON_FIDS } from "@nook/common/utils";
import { headers } from "next/headers";

export default async function Home() {
  const session = await getServerSession();

  const host = headers().get("host");
  const subdomain = host?.split(".")[0];

  if (subdomain === "farcon") {
    return (
      <FarcasterFilteredFeedServer
        filter={{
          users: {
            type: UserFilterType.FIDS,
            data: {
              fids: FARCON_FIDS,
            },
          },
        }}
      />
    );
  }

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
