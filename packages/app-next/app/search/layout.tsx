import { PageNavigation } from "../../components/PageNavigation";
import { getRecommendedChannels } from "@nook/app/api/neynar";
import { SearchSidebar } from "@nook/app/features/search/search-sidebar";
import { ReactNode } from "react";

export default async function Search({ children }: { children: ReactNode }) {
  const channels = await getRecommendedChannels();

  return (
    <PageNavigation sidebar={<SearchSidebar channels={channels} />}>
      {children}
    </PageNavigation>
  );
}
