import { FarcasterUserFollowers } from "@nook/app/features/farcaster/user-profile/user-followers";

export default async function User({
  params,
}: { params: { username: string } }) {
  return <FarcasterUserFollowers username={params.username} />;
}
