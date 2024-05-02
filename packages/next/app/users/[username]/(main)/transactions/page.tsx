import { fetchUser } from "@nook/app/api/farcaster";
import { TransactionFeedServer } from "@nook/app/features/transactions/transaction-feed-server";
import { UserFilterType } from "@nook/app/types";
import { notFound } from "next/navigation";

export default async function User({
  params,
}: { params: { username: string } }) {
  const user = await fetchUser(params.username);
  if (!user) {
    return notFound();
  }
  return (
    <TransactionFeedServer
      filter={{
        users: {
          type: UserFilterType.FIDS,
          data: {
            fids: [user.fid],
          },
        },
      }}
    />
  );
}
