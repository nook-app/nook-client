import { Channel } from "../../types";
import { makeRequest } from "../utils";
import { useQuery } from "@tanstack/react-query";

export const fetchChannel = async (channelId: string): Promise<Channel> => {
  return await makeRequest(`/farcaster/channels/${channelId}`);
};

export const useChannel = (channelId: string) => {
  return useQuery<Channel>({
    queryKey: ["channel", channelId],
    queryFn: async () => {
      const channel = await fetchChannel(channelId);
      return channel;
    },
  });
};
