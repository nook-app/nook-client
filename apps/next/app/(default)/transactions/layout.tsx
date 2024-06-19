import { getServerSession } from "@nook/app/server/session";
import { ReactNode } from "react";
import { TabNavigation } from "@nook/app/features/tabs";
import { NavigationHeader } from "../../../components/NavigationHeader";
import { notFound } from "next/navigation";

export default async function Home({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  if (!session) {
    return notFound();
  }

  return (
    <>
      <NavigationHeader title="Transactions" />
      <TabNavigation
        tabs={[
          {
            id: "for-you",
            label: "For You",
            href: "/transactions",
            auth: true,
          },
          {
            id: "all",
            label: "All",
            href: "/transactions/all",
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
