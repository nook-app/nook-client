import { FarcasterUserFollowers } from "@nook/app/features/farcaster/user-profile/user-followers";
import { fetchUserFollowers } from "@nook/app/server/feed";

export default async function User({
  params,
}: { params: { username: string } }) {
  const initialData = await fetchUserFollowers(params.username);
  return (
    <FarcasterUserFollowers
      username={params.username}
      initialData={initialData}
    />
  );
}
