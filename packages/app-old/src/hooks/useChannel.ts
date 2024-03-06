import { useAppSelector } from "./useAppSelector";
import { selectChannelById } from "@/store/slices/channel";

export const useChannel = (channelId: string) => {
  const channel = useAppSelector((state) =>
    selectChannelById(state, channelId),
  );

  return {
    channel,
  };
};
