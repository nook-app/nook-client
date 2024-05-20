import { ReactNode } from "react";
import { FarcasterFilteredFeedServer } from "@nook/app/features/farcaster/cast-feed/filtered-feed-server";
import { UserFilterType } from "@nook/common/types";
import { fetchUser } from "@nook/app/api/farcaster";

export default async function FollowingFeed({
  children,
  params,
}: { children: ReactNode; params: { username: string } }) {
  const user = await fetchUser(params.username);
  return (
    <FarcasterFilteredFeedServer
      filter={{
        users: {
          type: UserFilterType.FOLLOWING,
          data: {
            fid: user?.fid,
          },
        },
      }}
    />
  );
}
