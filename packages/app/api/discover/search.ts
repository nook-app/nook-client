import { Channel, FarcasterUserV1 } from "@nook/common/types";
import { makeRequest } from "../utils";

export const searchPreview = async (
  query: string,
): Promise<{ users: FarcasterUserV1[]; channels: Channel[] }> => {
  return await makeRequest(`/search/preview?query=${query}`);
};
