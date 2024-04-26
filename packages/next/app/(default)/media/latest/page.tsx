import {
  MediaAuthenticatedTabs,
  MediaUnauthenticatedTabs,
} from "@nook/app/features/home/media-tabs";
import { getServerSession } from "@nook/app/server/auth";

export default async function Home() {
  const session = await getServerSession();
  if (session) {
    return <MediaAuthenticatedTabs session={session} activeTab="latest" />;
  }

  return <MediaUnauthenticatedTabs activeTab="latest" />;
}
