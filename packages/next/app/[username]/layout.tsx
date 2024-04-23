import { fetchUser } from "@nook/app/api/farcaster";
import { PageNavigation } from "../../components/PageNavigation";
import { UserHeader } from "@nook/app/features/farcaster/user-profile/user-header";
import { UserSidebar } from "@nook/app/features/farcaster/user-profile/user-sidebar";

export default async function User({
  children,
  params,
}: { children: React.ReactNode; params: { username: string } }) {
  const user = await fetchUser(params.username);
  return (
    <PageNavigation sidebar={<UserSidebar user={user} />}>
      <UserHeader user={user} />
      {children}
    </PageNavigation>
  );
}
