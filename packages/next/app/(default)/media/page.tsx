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
          contentTypes: ["image", "application/x-mpegURL"],
        }}
        displayMode={Display.MEDIA}
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
        contentTypes: ["image", "application/x-mpegURL"],
      }}
      displayMode={Display.MEDIA}
    />
  );
}
