import { NftCollectionCollectors } from "@nook/app/features/nft/nft-collection-collectors";

export default async function Collectors({
  params,
}: { params: { collectionId: string } }) {
  return (
    <NftCollectionCollectors
      req={{
        collectionId: params.collectionId,
      }}
    />
  );
}
