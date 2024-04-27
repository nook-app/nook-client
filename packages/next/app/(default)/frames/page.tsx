import { FarcasterFilteredFeedServer } from "@nook/app/features/farcaster/cast-feed/filtered-feed-server";
import { getServerSession } from "@nook/app/server/auth";
import { Display, UserFilterType } from "@nook/app/types";

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
          onlyFrames: true,
        }}
        displayMode={Display.FRAMES}
      />
    );
  }

  return (
    <FarcasterFilteredFeedServer
      filter={{
        users: {
          type: UserFilterType.POWER_BADGE,
          data: {
            badge: true,
          },
        },
        onlyFrames: true,
      }}
      displayMode={Display.FRAMES}
    />
  );
}
