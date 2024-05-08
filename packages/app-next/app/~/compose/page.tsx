// https://warpcast.com/~/add-cast-action?url=https://fartcaster-action.vercel.app/api/fart

import { PageNavigation } from "../../../components/PageNavigation";
import { DefaultSidebar } from "@nook/app/features/home/default-sidebar";
import { ComposeScreen } from "@nook/app/features/farcaster/create-cast/compose-screen";
import { getServerSession } from "@nook/app/server/session";
import { notFound } from "next/navigation";

export default async function Compose({
  searchParams,
}: {
  searchParams: { text?: string; "embeds[]"?: string };
}) {
  const session = await getServerSession();
  if (!session) {
    return notFound();
  }

  return (
    <PageNavigation sidebar={<DefaultSidebar />}>
      <ComposeScreen {...searchParams} />
    </PageNavigation>
  );
}
