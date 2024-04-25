import { CastSidebar } from "@nook/app/features/farcaster/cast-screen/cast-sidebar";
import { PageNavigation } from "../../../../components/PageNavigation";
import { NavigationHeader } from "../../../../components/NavigationHeader";
import { fetchCast } from "@nook/app/api/farcaster";

export default async function Cast({
  children,
  params,
}: { children: React.ReactNode; params: { hash: string } }) {
  const cast = await fetchCast(params.hash);
  return (
    <PageNavigation sidebar={<CastSidebar cast={cast} />}>
      <NavigationHeader
        title="Cast Engagements"
        backHref={`/casts/${params.hash}`}
      />
      {children}
    </PageNavigation>
  );
}
