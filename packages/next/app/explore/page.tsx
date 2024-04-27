// TODO: Move this to backend with our own explore routes

import { ExploreScreen } from "@nook/app/features/explore/explore-screen";
import { getTrendingChannels } from "@nook/app/api/neynar";

export default async function Explore() {
  const channels = await getTrendingChannels();

  return <ExploreScreen channels={channels} />;
}
