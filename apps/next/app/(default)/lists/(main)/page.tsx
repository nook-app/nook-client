import { getServerSession } from "@nook/app/server/session";
import { ListFeed } from "@nook/app/features/list/list-feed";
import { ListType } from "@nook/common/types";

export default async function Home() {
  const session = await getServerSession();
  if (!session) return null;

  return <ListFeed filter={{ type: ListType.USERS, userId: session.id }} />;
}
