import { FarcasterFilteredFeedServer } from "@nook/app/features/farcaster/cast-feed/filtered-feed-server";
import { UserFilterType } from "@nook/common/types";

export default async function Home() {
  return (
    <FarcasterFilteredFeedServer
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
