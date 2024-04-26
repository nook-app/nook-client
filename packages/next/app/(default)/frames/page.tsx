import {
  FrameAuthenticatedTabs,
  FrameUnauthenticatedTabs,
} from "@nook/app/features/home/frame-tabs";
import { getServerSession } from "@nook/app/server/auth";

export default async function Home() {
  const session = await getServerSession();
  if (session) {
    return <FrameAuthenticatedTabs session={session} activeTab="following" />;
  }

  return <FrameUnauthenticatedTabs activeTab="latest" />;
}
