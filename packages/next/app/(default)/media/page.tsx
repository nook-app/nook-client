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
          contentTypes: ["image", "application/x-mpegURL"],
        }}
        displayMode={Display.MEDIA}
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
        contentTypes: ["image", "application/x-mpegURL"],
      }}
      displayMode={Display.MEDIA}
    />
  );
}
