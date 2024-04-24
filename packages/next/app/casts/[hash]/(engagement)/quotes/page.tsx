import { CastEngagementTabs } from "@nook/app/features/farcaster/cast-screen/cast-engagement-tabs";

export default async function CastQuotes({
  params,
}: { params: { hash: string } }) {
  return <CastEngagementTabs hash={params.hash} activeIndex={0} />;
}
