import { fetchUser } from "@nook/app/api/farcaster";
import { UserTabs } from "@nook/app/features/farcaster/user-profile/user-tabs";
import { notFound } from "next/navigation";

export default async function User({
  params,
}: { params: { username: string } }) {
  const user = await fetchUser(params.username);
  if (!user) return notFound();
  return <UserTabs user={user} activeTab="frames" />;
}
