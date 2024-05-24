// TODO: Move this to backend with our own explore routes

import { ExploreScreen } from "@nook/app/features/explore/explore-screen";
import { getRecommendedChannels } from "@nook/app/api/neynar";

export default async function Explore() {
  const channels = await getRecommendedChannels();

  return <ExploreScreen channels={channels} />;
}
