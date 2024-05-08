import { TransactionFeedServer } from "@nook/app/features/transactions/transaction-feed-server";
import { getServerSession } from "@nook/app/server/session";
import { UserFilterType } from "@nook/common/types";
import { View } from "tamagui";

export default async function Home() {
  const session = await getServerSession();
  if (session) {
    return (
      <TransactionFeedServer
        filter={{
          users: {
            type: UserFilterType.FOLLOWING,
            data: {
              fid: session?.fid,
            },
          },
        }}
      />
    );
  }

  return <></>;
}
