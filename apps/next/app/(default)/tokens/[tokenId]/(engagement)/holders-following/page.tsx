import { fetchToken } from "@nook/app/api/token";
import { FollowingTokenHolders } from "@nook/app/features/token/token-holders";

export default async function Holders({
  params,
}: { params: { tokenId: string } }) {
  const token = await fetchToken(params.tokenId);
  return <FollowingTokenHolders token={token} />;
}
