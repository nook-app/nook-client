import { fetchNftCollection } from "@nook/app/api/nft";
import { NftCollectionHeader } from "@nook/app/features/nft/nft-collection-header";
import { TabNavigation } from "@nook/app/features/tabs";

export default async function NftCollection({
  children,
  params,
}: { children: React.ReactNode; params: { collectionId: string } }) {
  const collection = await fetchNftCollection(params.collectionId);
  return (
    <>
      <NftCollectionHeader collection={collection} />
      <TabNavigation
        tabs={[
          {
            id: "activity",
            label: "Activity",
            href: `/collections/${params.collectionId}`,
          },
          {
            id: "items",
            label: "Items",
            href: `/collections/${params.collectionId}/items`,
          },
        ]}
      >
        {children}
      </TabNavigation>
    </>
  );
}
