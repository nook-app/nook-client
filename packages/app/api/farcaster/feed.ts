import { FarcasterFeedRequest, FetchCastsResponse } from "@nook/common/types";
import { makeRequest } from "../utils";

export const fetchCastFeed = async (
  req: FarcasterFeedRequest,
  requestInit?: RequestInit,
): Promise<FetchCastsResponse> => {
  return await makeRequest("/farcaster/casts", {
    ...requestInit,
    method: "POST",
    headers: {
      ...requestInit?.headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req),
  });
};

export const fetchCastReplies = async (
  hash: string,
  mode: "best" | "new" | "top",
  cursor?: string,
): Promise<FetchCastsResponse> => {
  return await makeRequest(
    `/farcaster/casts/${hash}/replies${mode !== "best" ? `/${mode}` : ""}${
      cursor ? `?cursor=${cursor}` : ""
    }`,
  );
};
