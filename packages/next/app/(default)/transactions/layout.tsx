import { getServerSession } from "@nook/app/server/auth";
import { ReactNode } from "react";
import { TabNavigation } from "@nook/app/features/tabs";
import { NavigationHeader } from "../../../components/NavigationHeader";

export default async function Home({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  return (
    <>
      <NavigationHeader title="Transactions" />
      <TabNavigation
        tabs={[
          {
            id: "following",
            label: "Following",
            href: "/transactions",
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
