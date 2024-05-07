import { fetchTransactionFeed } from "../../api/transactions";
import { TransactionFeedFilter } from "@nook/common/types";
import { TransactionFeed } from "./transaction-feed";

export const TransactionFeedServer = async ({
  filter,
}: {
  filter: TransactionFeedFilter;
}) => {
  const initialData = await fetchTransactionFeed(filter);

  if (!initialData) {
    return <></>;
  }

  return <TransactionFeed filter={filter} initialData={initialData} />;
};
