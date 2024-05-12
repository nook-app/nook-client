import { fetchTransactionFeed } from "../../api/transactions";
import { TransactionFeedFilter } from "@nook/common/types";
import { TransactionFeedWithChainSelector } from "./transaction-feed";

export const TransactionFeedServer = async ({
  filter,
}: {
  filter: TransactionFeedFilter;
}) => {
  const initialData = await fetchTransactionFeed(filter);

  if (!initialData) {
    return <></>;
  }

  return (
    <TransactionFeedWithChainSelector
      filter={filter}
      initialData={initialData}
    />
  );
};
