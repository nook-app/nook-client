import { TabNavigation } from "@nook/app/features/tabs";
import { getServerSession } from "@nook/app/server/session";

export default async function Home({
  children,
  params,
}: { children: React.ReactNode; params: { collectionId: string } }) {
  const session = await getServerSession();

  return (
    <TabNavigation
      tabs={[
        {
          id: "following",
          label: "Following",
          href: `/collections/${params.collectionId}/collectors-following`,
          auth: true,
        },
        {
          id: "farcaster",
          label: "On Farcaster",
          href: `/collections/${params.collectionId}/collectors-farcaster`,
        },
        {
          id: "all",
          label: "All",
          href: `/collections/${params.collectionId}/collectors`,
        },
      ]}
      session={session}
    >
      {children}
    </TabNavigation>
  );
}
