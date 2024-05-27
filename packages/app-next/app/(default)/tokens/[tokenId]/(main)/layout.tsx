import { TokenOverview } from "@nook/app/features/token/token-overview";
import { fetchToken } from "@nook/app/api/token";
import { TabNavigation } from "@nook/app/features/tabs";
import { SIMPLEHASH_CHAINS } from "@nook/common/utils";
import { getServerSession } from "@nook/app/server/session";

export default async function Home({
  children,
  params,
}: { children: React.ReactNode; params: { tokenId: string } }) {
  const session = await getServerSession();
  const token = await fetchToken(params.tokenId);

  const chains = token?.instances.map((instance) => instance.chainId);
  const holderInfoChains = SIMPLEHASH_CHAINS.filter(
    (chain) => chain.simplehashFungibles,
  ).map((chain) => chain.id);
  const hasHolderInfo =
    token?.id !== "eth" &&
    chains?.some((chain) => holderInfoChains.includes(chain));

  const tabs = [];
  if (hasHolderInfo) {
    tabs.push({
      id: "holders",
      label: "Holders",
      href: `/tokens/${token.id}`,
    });
    if (session?.fid) {
      tabs.push({
        id: "activity",
        label: "Activity",
        href: `/tokens/${token.id}/activity`,
      });
    }
    if (token.description) {
      tabs.push({
        id: "about",
        label: "About",
        href: `/tokens/${token.id}/about`,
      });
    }
  } else if (token.description) {
    tabs.push({
      id: "about",
      label: "About",
      href: `/tokens/${token.id}`,
    });
    if (session?.fid) {
      tabs.push({
        id: "activity",
        label: "Activity",
        href: `/tokens/${token.id}/activity`,
      });
    }
  } else if (session?.fid) {
    tabs.push({
      id: "activity",
      label: "Activity",
      href: `/tokens/${token.id}`,
    });
  }

  return (
    <>
      <TokenOverview token={token} color="white" />
      <TabNavigation tabs={tabs}>{children}</TabNavigation>
    </>
  );
}
