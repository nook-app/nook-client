import { fetchNftCollection } from "@nook/app/api/nft";
import { notFound } from "next/navigation";
import { NftCollectionEvents } from "@nook/app/features/nft/nft-events";

export default async function NftCollection({
  params,
}: { params: { collectionId: string } }) {
  const collection = await fetchNftCollection(params.collectionId);
  if (!collection) return notFound();
  return <NftCollectionEvents req={{ collectionId: params.collectionId }} />;
}
