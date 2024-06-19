import { NftFollowingCollectors } from "@nook/app/features/nft/nft-collectors";

export default async function Collectors({
  params,
}: { params: { nftId: string } }) {
  return (
    <NftFollowingCollectors
      req={{
        nftId: params.nftId,
      }}
    />
  );
}
