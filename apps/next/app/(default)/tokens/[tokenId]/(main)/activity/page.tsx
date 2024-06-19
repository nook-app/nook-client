import { fetchToken } from "@nook/app/api/token";
import { TokenTransactionsFeedViewer } from "@nook/app/features/token/token-transactions";

export default async function Home({
  params,
}: { params: { tokenId: string } }) {
  const token = await fetchToken(params.tokenId);

  return <TokenTransactionsFeedViewer token={token} />;
}
