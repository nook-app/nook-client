import { getServerSession } from "@nook/app/server/auth";
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
          href: "/",
          auth: true,
        },
        {
          id: "trending",
          label: "Trending",
          href: "/trending",
        },
        {
          id: "latest",
          label: "Latest",
          href: "/latest",
        },
      ]}
      session={session}
    >
      {children}
    </TabNavigation>
  );
}
