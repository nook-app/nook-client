// TODO: Move this to backend with our own explore routes

import { PageNavigation } from "../../components/PageNavigation";
import { ExploreScreen } from "@nook/app/features/explore/explore-screen";
import {
  getRecommendedChannels,
  getTrendingChannels,
} from "@nook/app/api/neynar";
import { ExploreSidebar } from "@nook/app/features/explore/explore-sidebar";

export default async function Explore() {
  const [channels, recommendedChannels] = await Promise.all([
    getTrendingChannels(),
    getRecommendedChannels(),
  ]);

  return (
    <PageNavigation sidebar={<ExploreSidebar channels={recommendedChannels} />}>
      <ExploreScreen channels={channels} />
    </PageNavigation>
  );
}
