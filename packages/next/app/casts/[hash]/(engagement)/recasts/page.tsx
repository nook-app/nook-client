import { FarcasterCastRecasts } from "@nook/app/features/farcaster/cast-screen/cast-recasts";

export default async function CastRecasts({
  params,
}: { params: { hash: string } }) {
  return <FarcasterCastRecasts hash={params.hash} />;
}
