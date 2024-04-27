import { FarcasterUserFollowing } from "@nook/app/features/farcaster/user-profile/user-following";

export default async function User({
  params,
}: { params: { username: string } }) {
  return <FarcasterUserFollowing username={params.username} />;
}
