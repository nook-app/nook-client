import { CastSidebar } from "@nook/app/features/farcaster/cast-screen/cast-sidebar";
import { PageNavigation } from "../../../../components/PageNavigation";
import { NavigationHeader } from "../../../../components/NavigationHeader";

export default async function Cast({
  children,
  params,
}: { children: React.ReactNode; params: { hash: string } }) {
  return (
    <PageNavigation sidebar={<CastSidebar hash={params.hash} />}>
      <NavigationHeader
        title="Cast Engagements"
        backHref={`/casts/${params.hash}`}
      />
      {children}
    </PageNavigation>
  );
}
