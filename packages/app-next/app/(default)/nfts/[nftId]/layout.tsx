import { fetchNft } from "@nook/app/api/nft";
import { NavigationHeader } from "../../../../components/NavigationHeader";

export default async function Home({
  children,
  params,
}: { children: React.ReactNode; params: { nftId: string } }) {
  const nft = await fetchNft(params.nftId);
  return (
    <>
      <NavigationHeader title={nft.name || "NFT"} />
      {children}
    </>
  );
}
