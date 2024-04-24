import { UserTabs } from "@nook/app/features/farcaster/user-profile/user-tabs";

export default async function User({
  params,
}: { params: { username: string } }) {
  return <UserTabs username={params.username} activeTab="media" />;
}
