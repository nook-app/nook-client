import { FarcasterFilteredFeedServer } from "@nook/app/features/farcaster/cast-feed/filtered-feed-server";
import { getServerSession } from "@nook/app/server/session";
import { UserFilterType } from "@nook/common/types";

export default async function Home() {
  const session = await getServerSession();

  console.log("1");

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

  return (
    <FarcasterFilteredFeedServer
      api="https://api.neynar.com/v2/farcaster/feed/trending"
      filter={{}}
    />
  );
}
