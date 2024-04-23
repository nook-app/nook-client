import { fetchCast } from "@nook/app/api/farcaster";
import { CastSidebar } from "@nook/app/features/farcaster/cast-screen/cast-sidebar";
import { PageNavigation } from "../../../components/PageNavigation";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

export default async function Cast({
  children,
  params,
}: { children: React.ReactNode; params: { hash: string } }) {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["cast", params.hash],
    queryFn: () => fetchCast(params.hash),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageNavigation
        sidebar={<CastSidebar hash={params.hash} />}
        headerTitle="Post"
      >
        {children}
      </PageNavigation>
    </HydrationBoundary>
  );
}
