import { fetchCast } from "@nook/app/api/farcaster";
import { FarcasterExpandedCast } from "@nook/app/features/farcaster/cast-screen/cast-expanded";
import { fetchCastReplies } from "@nook/app/server/feed";
import { notFound } from "next/navigation";

export default async function Cast({ params }: { params: { hash: string } }) {
  const [cast, initialData] = await Promise.all([
    fetchCast(params.hash),
    fetchCastReplies(params.hash, "best"),
  ]);
  if (!cast) return notFound();
  return <FarcasterExpandedCast cast={cast} initialData={initialData} />;
}
