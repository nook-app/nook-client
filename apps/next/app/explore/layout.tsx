// TODO: Move this to backend with our own explore routes

import { getRecommendedChannels } from "@nook/app/api/neynar";
import { ExploreSidebar } from "@nook/app/features/explore/explore-sidebar";
import { ReactNode } from "react";
import { PageNavigation } from "../../components/PageNavigation";

export default async function Explore({ children }: { children: ReactNode }) {
  const recommendedChannels = await getRecommendedChannels();

  return (
    <PageNavigation sidebar={<ExploreSidebar channels={recommendedChannels} />}>
      {children}
    </PageNavigation>
  );
}
