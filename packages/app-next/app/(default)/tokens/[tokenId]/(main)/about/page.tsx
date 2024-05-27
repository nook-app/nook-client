import { fetchToken } from "@nook/app/api/token";
import { TokenDescription } from "@nook/app/features/token/token-overview";

export default async function Home({
  params,
}: { params: { tokenId: string } }) {
  const token = await fetchToken(params.tokenId);

  if (token.description) {
    return <TokenDescription token={token} />;
  }

  return null;
}
