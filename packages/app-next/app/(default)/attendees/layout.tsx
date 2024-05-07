import { getServerSession } from "@nook/app/server/auth";
import { NavigationHeader } from "../../../components/NavigationHeader";
import { notFound } from "next/navigation";
import { TabNavigation } from "@nook/app/features/tabs";

export default async function Home({
  children,
}: { children: React.ReactNode }) {
  const session = await getServerSession();
  return (
    <>
      <NavigationHeader title="FarCon Attendees" />
      <TabNavigation
        tabs={[
          {
            id: "everyone",
            label: "Everyone",
            href: "/attendees",
          },
          {
            id: "following",
            label: "Following",
            href: "/attendees/following",
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
