import { FarcasterFilteredFeed } from "@nook/app/features/farcaster/cast-feed/filtered-feed";
import { Display, UserFilterType } from "@nook/app/types";

export default async function Home() {
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
