import {
  UserEngagementAuthenticatedTabs,
  UserEngagementUnauthenticatedTabs,
} from "@nook/app/features/farcaster/user-profile/user-engagement-tabs";
import { getServerSession } from "@nook/app/server/actions";

export default async function User({
  params,
}: { params: { username: string } }) {
  const session = await getServerSession();
  if (session) {
    return (
      <UserEngagementAuthenticatedTabs
        username={params.username}
        activeTab="mutuals"
      />
    );
  }

  return (
    <UserEngagementUnauthenticatedTabs
      username={params.username}
      activeTab="mutuals"
    />
  );
}
