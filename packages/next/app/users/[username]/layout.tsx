import { fetchUser } from "@nook/app/api/farcaster";
import { PageNavigation } from "../../../components/PageNavigation";
import { UserHeader } from "@nook/app/features/farcaster/user-profile/user-header";
import { UserSidebar } from "@nook/app/features/farcaster/user-profile/user-sidebar";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";

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
      <PageNavigation
        sidebar={<UserSidebar username={params.username} />}
        headerTitle={user.displayName || `@${user.username}`}
      >
        <UserHeader username={params.username} />
        {children}
      </PageNavigation>
    </HydrationBoundary>
  );
}
