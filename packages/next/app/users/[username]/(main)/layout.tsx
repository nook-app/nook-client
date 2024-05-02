import { fetchUser } from "@nook/app/api/farcaster";
import { UserHeader } from "@nook/app/features/farcaster/user-profile/user-header";
import { TabNavigation } from "@nook/app/features/tabs";

export default async function User({
  children,
  params,
}: { children: React.ReactNode; params: { username: string } }) {
  const user = await fetchUser(params.username);
  return (
    <>
      <UserHeader user={user} />
      <TabNavigation
        tabs={[
          {
            id: "casts",
            label: "Casts",
            href: `/users/${user.username}`,
          },
          {
            id: "replies",
            label: "Replies",
            href: `/users/${user.username}/replies`,
          },
          {
            id: "transactions",
            label: "Transactions",
            href: `/users/${user.username}/transactions`,
          },
          {
            id: "media",
            label: "Media",
            href: `/users/${user.username}/media`,
          },
          {
            id: "frames",
            label: "Frames",
            href: `/users/${user.username}/frames`,
          },
        ]}
      >
        {children}
      </TabNavigation>
    </>
  );
}
