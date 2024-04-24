import { fetchUser } from "@nook/app/api/farcaster";
import { UserSidebar } from "@nook/app/features/farcaster/user-profile/user-sidebar";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { PageNavigation } from "../../../components/PageNavigation";
import { NavigationHeader } from "../../../components/NavigationHeader";

export default async function User({
  children,
  params,
}: { children: React.ReactNode; params: { username: string } }) {
  const user = await fetchUser(params.username);
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["user", params.username],
    queryFn: () => fetchUser(params.username),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PageNavigation sidebar={<UserSidebar username={params.username} />}>
        <NavigationHeader title={user.displayName || `@${user.username}`} />
        {children}
      </PageNavigation>
    </HydrationBoundary>
  );
}
