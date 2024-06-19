import { getServerSession } from "@nook/app/server/session";
import { NavigationHeader } from "../../../../components/NavigationHeader";
import { notFound } from "next/navigation";
import { TabNavigation } from "@nook/app/features/tabs";

export default async function Home({
  children,
}: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) return notFound();
  return (
    <>
      <NavigationHeader title="Lists" />
      <TabNavigation
        tabs={[
          {
            id: "users",
            label: "Users",
            href: "/lists",
            auth: true,
          },
          {
            id: "channels",
            label: "Channels",
            href: "/lists/channels",
            auth: true,
          },
        ]}
        session={session}
      >
        {children}
      </TabNavigation>
    </>
  );
}
