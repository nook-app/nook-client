import {
  FetchTransactionsResponseV1,
  TransactionFeedFilter,
} from "@nook/common/types";
import { makeRequest } from "../utils";

export const fetchTransactionFeed = async (
  filter: TransactionFeedFilter,
  cursor?: string,
): Promise<FetchTransactionsResponseV1> => {
  return await makeRequest("/v1/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filter, cursor }),
  });
};
