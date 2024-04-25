import { fetchUser } from "@nook/app/api/farcaster";
import { UserSidebar } from "@nook/app/features/farcaster/user-profile/user-sidebar";
import { PageNavigation } from "../../../components/PageNavigation";
import { NavigationHeader } from "../../../components/NavigationHeader";

export default async function User({
  children,
  params,
}: { children: React.ReactNode; params: { username: string } }) {
  const user = await fetchUser(params.username);
  return (
    <PageNavigation sidebar={<UserSidebar user={user} />}>
      <NavigationHeader title={user.displayName || `@${user.username}`} />
      {children}
    </PageNavigation>
  );
}
