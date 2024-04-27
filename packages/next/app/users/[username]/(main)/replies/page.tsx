import { fetchUser } from "@nook/app/api/farcaster";
import { FarcasterFilteredFeed } from "@nook/app/features/farcaster/cast-feed/filtered-feed";
import { UserFilterType } from "@nook/app/types";
import { notFound } from "next/navigation";

export default async function User({
  params,
}: { params: { username: string } }) {
  const user = await fetchUser(params.username);
  if (!user) return notFound();
  return (
    <FarcasterFilteredFeed
      filter={{
        users: { type: UserFilterType.FIDS, data: { fids: [user.fid] } },
        onlyReplies: true,
      }}
    />
  );
}
