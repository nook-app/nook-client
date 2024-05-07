import { fetchUser } from "@nook/app/api/farcaster";
import { getUserHighlights } from "@nook/app/api/neynar";
import { FarcasterInfiniteFeed } from "@nook/app/features/farcaster/cast-feed/infinite-feed";
import { notFound } from "next/navigation";

export default async function User({
  params,
}: { params: { username: string } }) {
  const user = await fetchUser(params.username);
  if (!user) {
    return notFound();
  }
  const highlights = await getUserHighlights(user.fid);
  return <FarcasterInfiniteFeed casts={highlights.data} />;
}
