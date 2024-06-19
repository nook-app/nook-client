import { fetchToken } from "@nook/app/api/token";
import { FarcasterTokenHolders } from "@nook/app/features/token/token-holders";

export default async function Holders({
  params,
}: { params: { tokenId: string } }) {
  const token = await fetchToken(params.tokenId);
  return <FarcasterTokenHolders token={token} />;
}
