import { NotificationsMentionsFeedServer } from "@nook/app/features/notifications/notifications-feed-server";
import { getServerSession } from "@nook/app/server/session";

export default async function Home() {
  const session = await getServerSession();
  if (!session) return null;

  return <NotificationsMentionsFeedServer fid={session.fid} />;
}
