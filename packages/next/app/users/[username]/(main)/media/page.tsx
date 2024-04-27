import { fetchUser } from "@nook/app/api/farcaster";
import { FarcasterFilteredFeedServer } from "@nook/app/features/farcaster/cast-feed/filtered-feed-server";
import { Display, UserFilterType } from "@nook/app/types";
import { notFound } from "next/navigation";

export default async function User({
  params,
}: { params: { username: string } }) {
  const user = await fetchUser(params.username);
  if (!user) return notFound();
  return (
    <FarcasterFilteredFeedServer
      filter={{
        users: { type: UserFilterType.FIDS, data: { fids: [user.fid] } },
        contentTypes: ["image"],
      }}
      displayMode={Display.GRID}
    />
  );
}
