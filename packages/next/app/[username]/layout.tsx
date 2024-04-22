import { fetchUser } from "@nook/app/api/farcaster";
import { PageNavigation } from "../../components/PageNavigation";
import { UserHeader } from "@nook/app/features/farcaster/user-profile/user-header";

export default async function User({
  children,
  params,
}: { children: React.ReactNode; params: { username: string } }) {
  const user = await fetchUser(params.username);
  return (
    <PageNavigation>
      <UserHeader user={user} />
      {children}
    </PageNavigation>
  );
}
