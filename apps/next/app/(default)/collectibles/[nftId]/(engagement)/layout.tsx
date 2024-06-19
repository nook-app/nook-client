import { TabNavigation } from "@nook/app/features/tabs";
import { getServerSession } from "@nook/app/server/session";

export default async function Home({
  children,
  params,
}: { children: React.ReactNode; params: { nftId: string } }) {
  const session = await getServerSession();

  return (
    <TabNavigation
      tabs={[
        {
          id: "following",
          label: "Following",
          href: `/collectibles/${params.nftId}/collectors-following`,
          auth: true,
        },
        {
          id: "farcaster",
          label: "On Farcaster",
          href: `/collectibles/${params.nftId}/collectors-farcaster`,
        },
        {
          id: "all",
          label: "All",
          href: `/collectibles/${params.nftId}/collectors`,
        },
      ]}
      session={session}
    >
      {children}
    </TabNavigation>
  );
}
