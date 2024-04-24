import { UserEngagementTabs } from "@nook/app/features/farcaster/user-profile/user-engagement-tabs";

export default async function User({
  params,
}: { params: { username: string } }) {
  return <UserEngagementTabs username={params.username} activeIndex={1} />;
}
