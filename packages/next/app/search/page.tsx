import { redirect } from "next/navigation";
import { SearchScreen } from "@nook/app/features/search/search-screen";

export default async function Search({
  searchParams,
}: { searchParams: { q: string; f?: string } }) {
  if (!searchParams.q) {
    return redirect("/explore");
  }

  return <SearchScreen {...searchParams} />;
}
