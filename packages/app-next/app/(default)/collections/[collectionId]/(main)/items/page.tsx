import { fetchNftCollection } from "@nook/app/api/nft";
import { CollectionNftsFeed } from "@nook/app/features/nft/nft-feed";
import { notFound } from "next/navigation";

export default async function NftCollection({
  params,
}: { params: { collectionId: string } }) {
  const collection = await fetchNftCollection(params.collectionId);
  if (!collection) return notFound();
  return <CollectionNftsFeed collectionId={params.collectionId} />;
}
