import { NftFarcasterCollectors } from "@nook/app/features/nft/nft-collectors";

export default async function Collectors({
  params,
}: { params: { nftId: string } }) {
  return (
    <NftFarcasterCollectors
      req={{
        nftId: params.nftId,
      }}
    />
  );
}
