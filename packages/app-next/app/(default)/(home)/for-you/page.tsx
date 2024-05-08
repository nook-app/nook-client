import { FarcasterFilteredFeedServer } from "@nook/app/features/farcaster/cast-feed/filtered-feed-server";
import { getServerSession } from "@nook/app/server/session";
import { UserFilterType } from "@nook/common/types";

export default async function Home() {
  const session = await getServerSession();
  if (!session) return null;
  return (
    <FarcasterFilteredFeedServer
      api={`https://graph.cast.k3l.io/casts/personalized/popular/${session?.fid}`}
      filter={{
        users: {
          type: UserFilterType.POWER_BADGE,
          data: {
            badge: true,
          },
        },
      }}
    />
  );
}
