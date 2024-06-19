import { FarcasterUserFollowers } from "@nook/app/features/farcaster/user-profile/user-followers";
import { fetchUser, fetchUserFollowers } from "@nook/app/api/farcaster/users";

export default async function User({
  params,
}: { params: { username: string } }) {
  const user = await fetchUser(params.username);
  const initialData = await fetchUserFollowers(user.fid);
  return <FarcasterUserFollowers fid={user.fid} initialData={initialData} />;
}
