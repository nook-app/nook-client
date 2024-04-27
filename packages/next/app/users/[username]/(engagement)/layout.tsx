import { ReactNode } from "react";
import { getServerSession } from "@nook/app/server/auth";
import { TabNavigation } from "@nook/app/features/tabs";

export default async function Cast({
  children,
  params,
}: { children: ReactNode; params: { username: string } }) {
  const session = await getServerSession();
  return (
    <TabNavigation
      tabs={[
        {
          id: "mutuals",
          label: "Followers you know",
          href: `/users/${params.username}/mutuals`,
          auth: true,
        },
        {
          id: "followers",
          label: "Followers",
          href: `/users/${params.username}/followers`,
        },
        {
          id: "following",
          label: "Following",
          href: `/users/${params.username}/following`,
        },
      ]}
      session={session}
    >
      {children}
    </TabNavigation>
  );
}
