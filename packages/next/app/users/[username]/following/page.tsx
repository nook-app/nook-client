import {
  UserEngagementAuthenticatedTabs,
  UserEngagementUnauthenticatedTabs,
} from "@nook/app/features/farcaster/user-profile/user-engagement-tabs";
import { getServerSession } from "@nook/app/server/auth";

export default async function User({
  params,
}: { params: { username: string } }) {
  const session = await getServerSession();
  if (session) {
    return (
      <UserEngagementAuthenticatedTabs
        username={params.username}
        activeTab="following"
      />
    );
  }

  return (
    <UserEngagementUnauthenticatedTabs
      username={params.username}
      activeTab="following"
    />
  );
}
