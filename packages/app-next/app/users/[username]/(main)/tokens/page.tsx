import { fetchUser } from "@nook/app/api/farcaster";
import { notFound } from "next/navigation";
import { TokenHoldings } from "@nook/app/features/token/token-holdings";

export default async function User({
  params,
}: { params: { username: string } }) {
  const user = await fetchUser(params.username);
  if (!user) {
    return notFound();
  }
  return (
    <TokenHoldings
      filter={{
        fid: user.fid,
      }}
    />
  );
}
