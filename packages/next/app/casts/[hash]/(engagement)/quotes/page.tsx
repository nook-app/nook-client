import { FarcasterCastQuotes } from "@nook/app/features/farcaster/cast-screen/cast-quotes";

export default async function CastQuotes({
  params,
}: { params: { hash: string } }) {
  return <FarcasterCastQuotes hash={params.hash} />;
}
