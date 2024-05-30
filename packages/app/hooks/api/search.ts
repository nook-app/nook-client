import { Channel, FarcasterUserV1 } from "@nook/common/types";
import { useQuery } from "@tanstack/react-query";
import { useChannelStore } from "../../store/useChannelStore";
import { useUserStore } from "../../store/useUserStore";
import { searchPreview } from "../../api/discover";

export const useSearchPreview = (query: string) => {
  const addChannels = useChannelStore((state) => state.addChannels);
  const addUsers = useUserStore((state) => state.addUsers);
  return useQuery<{ users: FarcasterUserV1[]; channels: Channel[] }>({
    queryKey: ["search-preview", query],
    queryFn: async () => {
      const data = await searchPreview(query);
      addChannels(data.channels);
      addUsers(data.users);
      return data;
    },
    enabled: !!query,
  });
};
