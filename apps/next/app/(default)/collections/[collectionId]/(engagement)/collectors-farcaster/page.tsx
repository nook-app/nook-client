import { NftCollectionFarcasterCollectors } from "@nook/app/features/nft/nft-collection-collectors";

export default async function Collectors({
  params,
}: { params: { collectionId: string } }) {
  return (
    <NftCollectionFarcasterCollectors
      req={{
        collectionId: params.collectionId,
      }}
    />
  );
}
