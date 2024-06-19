import { fetchList } from "@nook/app/api/list";
import { TransactionFeedServer } from "@nook/app/features/transactions/transaction-feed-server";
import { UserFilterType } from "@nook/common/types";

export default async function Home({ params }: { params: { listId: string } }) {
  const list = await fetchList(params.listId);

  return (
    <TransactionFeedServer
      filter={{
        users: {
          type: UserFilterType.FIDS,
          data: {
            fids: list.users?.map(({ fid }) => fid) ?? [],
          },
        },
      }}
    />
  );
}
