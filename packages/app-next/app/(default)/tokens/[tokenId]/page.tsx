import { fetchToken } from "@nook/app/api/token";
import { TokenOverview } from "@nook/app/features/token/token-overview";

export default async function Home({
  params,
}: { params: { tokenId: string } }) {
  const token = await fetchToken(params.tokenId);
  return <TokenOverview token={token} color="white" />;
}
