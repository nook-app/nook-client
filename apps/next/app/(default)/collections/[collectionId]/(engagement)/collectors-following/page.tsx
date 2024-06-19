import { NftCollectionFollowingCollectors } from "@nook/app/features/nft/nft-collection-collectors";

export default async function Collectors({
  params,
}: { params: { collectionId: string } }) {
  return (
    <NftCollectionFollowingCollectors
      req={{
        collectionId: params.collectionId,
      }}
    />
  );
}
