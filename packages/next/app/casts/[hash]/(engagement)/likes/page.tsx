import { FarcasterCastLikes } from "@nook/app/features/farcaster/cast-screen/cast-likes";

export default async function CastLikes({
  params,
}: { params: { hash: string } }) {
  return <FarcasterCastLikes hash={params.hash} />;
}
