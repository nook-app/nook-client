import { FarcasterUserMutuals } from "@nook/app/features/farcaster/user-profile/user-mutuals";
import { getServerSession } from "@nook/app/server/auth";
import { notFound } from "next/navigation";

export default async function User({
  params,
}: { params: { username: string } }) {
  const session = await getServerSession();
  if (!session) return notFound();
  return <FarcasterUserMutuals username={params.username} />;
}
