import { FarcasterExpandedCast } from "@nook/app/features/farcaster/cast-screen/cast-expanded";

export default async function Cast({ params }: { params: { hash: string } }) {
  return <FarcasterExpandedCast hash={params.hash} />;
}
