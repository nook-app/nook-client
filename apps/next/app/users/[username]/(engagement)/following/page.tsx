import { FarcasterUserFollowing } from "@nook/app/features/farcaster/user-profile/user-following";
import { fetchUser, fetchUserFollowing } from "@nook/app/api/farcaster/users";

export default async function User({
  params,
}: { params: { username: string } }) {
  const user = await fetchUser(params.username);
  const initialData = await fetchUserFollowing(user.fid);
  return <FarcasterUserFollowing fid={user.fid} initialData={initialData} />;
}
