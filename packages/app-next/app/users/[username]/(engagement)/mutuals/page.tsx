import { FarcasterUserMutuals } from "@nook/app/features/farcaster/user-profile/user-mutuals";
import { getServerSession } from "@nook/app/server/session";
import { fetchUser, fetchUserMutuals } from "@nook/app/api/farcaster/users";
import { notFound } from "next/navigation";

export default async function User({
  params,
}: { params: { username: string } }) {
  const session = await getServerSession();
  if (!session) return notFound();
  const user = await fetchUser(params.username);
  const initialData = await fetchUserMutuals(user.fid);
  return <FarcasterUserMutuals fid={user.fid} initialData={initialData} />;
}
