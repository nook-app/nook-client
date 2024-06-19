import { fetchToken } from "@nook/app/api/token";
import { TokenHolders } from "@nook/app/features/token/token-holders";

export default async function Holders({
  params,
}: { params: { tokenId: string } }) {
  const token = await fetchToken(params.tokenId);
  return <TokenHolders token={token} />;
}
