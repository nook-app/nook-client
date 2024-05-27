import { TabNavigation } from "@nook/app/features/tabs";
import { getServerSession } from "@nook/app/server/session";

export default async function Home({
  children,
  params,
}: { children: React.ReactNode; params: { tokenId: string } }) {
  const session = await getServerSession();

  return (
    <TabNavigation
      tabs={[
        {
          id: "following",
          label: "Following",
          href: `/tokens/${params.tokenId}/holders-following`,
          auth: true,
        },
        {
          id: "farcaster",
          label: "On Farcaster",
          href: `/tokens/${params.tokenId}/holders-farcaster`,
        },
        {
          id: "all",
          label: "All",
          href: `/tokens/${params.tokenId}/holders`,
        },
      ]}
      session={session}
    >
      {children}
    </TabNavigation>
  );
}
