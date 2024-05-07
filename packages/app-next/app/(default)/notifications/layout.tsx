import { getServerSession } from "@nook/app/server/auth";
import { NavigationHeader } from "../../../components/NavigationHeader";
import { notFound } from "next/navigation";
import { TabNavigation } from "@nook/app/features/tabs";

export default async function Home({
  children,
}: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) return notFound();
  return (
    <>
      <NavigationHeader title="Notifications" />
      <TabNavigation
        tabs={[
          {
            id: "priority",
            label: "Priority",
            href: "/notifications",
            auth: true,
          },
          {
            id: "mentions",
            label: "Mentions",
            href: "/notifications/mentions",
            auth: true,
          },
          {
            id: "all",
            label: "All",
            href: "/notifications/all",
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
