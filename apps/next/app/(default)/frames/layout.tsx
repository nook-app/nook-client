import { getServerSession } from "@nook/app/server/session";
import { ReactNode } from "react";
import { TabNavigation } from "@nook/app/features/tabs";

export default async function Home({ children }: { children: ReactNode }) {
  const session = await getServerSession();
  return (
    <TabNavigation
      tabs={[
        {
          id: "following",
          label: "Following",
          href: "/frames",
          auth: true,
        },
        {
          id: "latest",
          label: "Latest",
          href: "/frames/latest",
        },
      ]}
      session={session}
    >
      {children}
    </TabNavigation>
  );
}
