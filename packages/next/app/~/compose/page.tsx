// https://warpcast.com/~/add-cast-action?url=https://fartcaster-action.vercel.app/api/fart

import { PageNavigation } from "../../../components/PageNavigation";
import { DefaultSidebar } from "@nook/app/features/home/default-sidebar";
import { ComposeScreen } from "@nook/app/features/farcaster/create-cast/compose-screen";

export default async function Install({
  searchParams,
}: {
  searchParams: { text?: string; "embeds[]"?: string };
}) {
  return (
    <PageNavigation sidebar={<DefaultSidebar />}>
      <ComposeScreen {...searchParams} />
    </PageNavigation>
  );
}
