import {
  HomeAuthenticatedTabs,
  HomeUnauthenticatedTabs,
} from "@nook/app/features/home/home-tabs";
import { getServerSession } from "@nook/app/server/auth";

export default async function Home() {
  const session = await getServerSession();
  if (session) {
    return <HomeAuthenticatedTabs session={session} activeTab="following" />;
  }

  return <HomeUnauthenticatedTabs activeTab="trending" />;
}
