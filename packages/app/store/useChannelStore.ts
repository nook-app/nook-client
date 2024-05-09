import { create } from "zustand";
import { Channel } from "@nook/common/types";

interface ChannelStore {
  channels: Record<string, Channel>;
  addChannels: (channels: Channel[]) => void;
}

export const useChannelStore = create<ChannelStore>((set, get) => ({
  channels: {},
  addChannels: (channels: Channel[]) => {
    const currentChannels = get().channels;
    const newChannels = channels.reduce(
      (acc, channel) => {
        acc[channel.channelId] = channel;
        return acc;
      },
      {} as Record<string, Channel>,
    );
    set({ channels: { ...currentChannels, ...newChannels } });
  },
}));
