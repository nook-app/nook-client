import { ReactNode } from "react";
import { getServerSession } from "@nook/app/server/session";
import { TabNavigation } from "@nook/app/features/tabs";

export default async function Cast({
  children,
  params,
}: { children: ReactNode; params: { hash: string } }) {
  const session = await getServerSession();
  return (
    <TabNavigation
      tabs={[
        {
          id: "quotes",
          label: "Quotes",
          href: `/casts/${params.hash}/quotes`,
        },
        {
          id: "recasts",
          label: "Recasts",
          href: `/casts/${params.hash}/recasts`,
        },
        {
          id: "likes",
          label: "Likes",
          href: `/casts/${params.hash}/likes`,
        },
      ]}
      session={session}
    >
      {children}
    </TabNavigation>
  );
}
