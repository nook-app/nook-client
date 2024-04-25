import { redirect } from "next/navigation";
import { PageNavigation } from "../../components/PageNavigation";
import { SearchScreen } from "@nook/app/features/search/search-screen";
import { getRecommendedChannels } from "@nook/app/api/neynar";
import { SearchSidebar } from "@nook/app/features/search/search-sidebar";

export default async function Search({
  searchParams,
}: { searchParams: { q: string; f?: string } }) {
  if (!searchParams.q) {
    return redirect("/explore");
  }

  const channels = await getRecommendedChannels();

  return (
    <PageNavigation sidebar={<SearchSidebar channels={channels} />}>
      <SearchScreen {...searchParams} />
    </PageNavigation>
  );
}
