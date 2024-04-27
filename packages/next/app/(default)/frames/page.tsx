import { FarcasterFilteredFeed } from "@nook/app/features/farcaster/cast-feed/filtered-feed";
import { getServerSession } from "@nook/app/server/auth";
import { Display, UserFilterType } from "@nook/app/types";

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
          onlyFrames: true,
        }}
        displayMode={Display.FRAMES}
      />
    );
  }

  return (
    <FarcasterFilteredFeed
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
