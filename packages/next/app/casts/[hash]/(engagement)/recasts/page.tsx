import { CastEngagementTabs } from "@nook/app/features/farcaster/cast-screen/cast-engagement-tabs";

export default async function CastRecasts({
  params,
}: { params: { hash: string } }) {
  return <CastEngagementTabs hash={params.hash} activeTab="recasts" />;
}
