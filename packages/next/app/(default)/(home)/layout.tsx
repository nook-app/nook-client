import { getServerSession } from "@nook/app/server/auth";
import { ReactNode } from "react";
import { TabNavigation } from "@nook/app/features/tabs";
import { MobileNavigationHeader } from "../../../components/MobileNavigation";
import { headers } from "next/headers";

export default async function Home({ children }: { children: ReactNode }) {
  const host = headers().get("host");
  const subdomain = host?.split(".")[0];

  const session = await getServerSession();

  return (
    <>
      <MobileNavigationHeader />
      {subdomain !== "farcon" && (
        <TabNavigation
          tabs={[
            {
              id: "following",
              label: "Following",
              href: "/",
              auth: true,
            },
            {
              id: "for-you",
              label: "For you",
              href: "/for-you",
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
      )}
      {subdomain === "farcon" && (
        <TabNavigation
          tabs={[
            {
              id: "from-attendees",
              label: "From Attendees",
              href: "/",
            },
          ]}
          session={session}
        >
          {children}
        </TabNavigation>
      )}
    </>
  );
}
