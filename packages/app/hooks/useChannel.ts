import { useQuery } from "@tanstack/react-query";
import { fetchChannel } from "../api/farcaster";
import { useChannelStore } from "../store/useChannelStore";

export const useChannel = (channelId: string) => {
  const storedChannel = useChannelStore((state) => state.channels[channelId]);
  const addChannels = useChannelStore((state) => state.addChannels);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["channel", channelId],
    queryFn: async () => {
      const channel = await fetchChannel(channelId);
      if (channel) {
        addChannels([channel]);
      }
      return channel;
    },
    enabled: !storedChannel,
  });

  return { channel: storedChannel || data, isLoading, isError, error };
};
