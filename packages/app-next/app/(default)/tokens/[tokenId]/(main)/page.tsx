import { fetchToken } from "@nook/app/api/token";
import { TokenDescription } from "@nook/app/features/token/token-overview";
import { SIMPLEHASH_CHAINS } from "@nook/common/utils";
import {
  FarcasterTokenHolders,
  FarcasterTokenHoldersHeader,
} from "@nook/app/features/token/token-holders";
import { TokenTransactionsFeedViewer } from "@nook/app/features/token/token-transactions";

export default async function Home({
  params,
}: { params: { tokenId: string } }) {
  const token = await fetchToken(params.tokenId);

  const chains = token?.instances.map((instance) => instance.chainId);
  const holderInfoChains = SIMPLEHASH_CHAINS.filter(
    (chain) => chain.simplehashFungibles,
  ).map((chain) => chain.id);
  const hasHolderInfo =
    token?.id !== "eth" &&
    chains?.some((chain) => holderInfoChains.includes(chain));

  if (!hasHolderInfo) {
    if (token.description) {
      return <TokenDescription token={token} />;
    }
    return <TokenTransactionsFeedViewer token={token} />;
  }
  return (
    <FarcasterTokenHolders
      token={token}
      asTabs
      ListHeaderComponent={<FarcasterTokenHoldersHeader token={token} />}
    />
  );
}
