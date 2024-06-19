import { fetchNft } from "@nook/app/api/nft";
import { NftOverviewScreen } from "@nook/app/features/nft/nft-overview-screen";

export default async function Home({ params }: { params: { nftId: string } }) {
  const nft = await fetchNft(params.nftId);

  return <NftOverviewScreen nft={nft} />;
}
