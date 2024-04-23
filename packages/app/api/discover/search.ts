import { Channel, FarcasterUser } from "../../types";
import { makeRequest } from "../utils";
import { useQuery } from "@tanstack/react-query";

export const searchPreview = async (
  query: string,
): Promise<{ users: FarcasterUser[]; channels: Channel[] }> => {
  return await makeRequest(`/search/preview?query=${query}`);
};

export const useSearchPreview = (query: string) => {
  return useQuery<{ users: FarcasterUser[]; channels: Channel[] }>({
    queryKey: ["search-preview", query],
    queryFn: async () => {
      const channel = await searchPreview(query);
      return channel;
    },
    enabled: !!query,
  });
};
