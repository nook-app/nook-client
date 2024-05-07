import { FarcasterCastLikes } from "@nook/app/features/farcaster/cast-screen/cast-likes";
import { fetchCastLikes } from "@nook/app/server/feed";

export default async function CastLikes({
  params,
}: { params: { hash: string } }) {
  const initialData = await fetchCastLikes(params.hash);
  return <FarcasterCastLikes hash={params.hash} initialData={initialData} />;
}
