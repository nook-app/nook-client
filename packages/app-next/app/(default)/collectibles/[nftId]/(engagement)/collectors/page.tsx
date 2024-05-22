import { NftCollectors } from "@nook/app/features/nft/nft-collectors";

export default async function Collectors({
  params,
}: { params: { nftId: string } }) {
  return (
    <NftCollectors
      req={{
        nftId: params.nftId,
      }}
    />
  );
}
