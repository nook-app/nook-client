import { fetchCast } from "@nook/app/api/farcaster";
import { FarcasterExpandedCast } from "@nook/app/features/farcaster/cast-screen/cast-expanded";
import { notFound } from "next/navigation";

export default async function Cast({ params }: { params: { hash: string } }) {
  const cast = await fetchCast(params.hash);
  if (!cast) return notFound();
  return <FarcasterExpandedCast cast={cast} />;
}
