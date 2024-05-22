import { fetchNftCollection } from "@nook/app/api/nft";
import { NavigationHeader } from "../../../../components/NavigationHeader";
import { ReactNode } from "react";

export default async function Home({
  children,
  params,
}: { children: ReactNode; params: { collectionId: string } }) {
  const nftCollection = await fetchNftCollection(params.collectionId);
  return (
    <>
      <NavigationHeader title={nftCollection.name || "Collection"} />
      {children}
    </>
  );
}
