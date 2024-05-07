import { UrlContentResponse } from "@nook/common/types";
import { makeRequest } from "../utils";

export const fetchContent = async (
  uri: string,
): Promise<UrlContentResponse | undefined> => {
  return await makeRequest("/content", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uri }),
  });
};
