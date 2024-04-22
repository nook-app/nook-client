import { fetchUser } from "@nook/app/api/farcaster";
import { UserTabs } from "@nook/app/features/farcaster/user-profile/user-tabs";

export default async function User({
  params,
}: { params: { username: string } }) {
  const user = await fetchUser(params.username);
  return <UserTabs user={user} activeTab="media" />;
}
