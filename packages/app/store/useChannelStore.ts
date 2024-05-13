import { create } from "zustand";
import {
  Channel,
  FarcasterCastResponse,
  NotificationResponse,
} from "@nook/common/types";

interface ChannelStore {
  channels: Record<string, Channel>;
  addChannels: (channels: Channel[]) => void;
  addChannelsFromCasts: (casts: FarcasterCastResponse[]) => void;
  addChannelsFromNotifications: (notifications: NotificationResponse[]) => void;
}

export const useChannelStore = create<ChannelStore>((set, get) => ({
  channels: {},
  addChannels: (channels: Channel[]) => {
    const currentChannels = get().channels;
    const newChannels = channels.reduce(
      (acc, channel) => {
        if (acc[channel.channelId]) return acc;
        acc[channel.channelId] = channel;
        return acc;
      },
      {} as Record<string, Channel>,
    );
    set({ channels: { ...currentChannels, ...newChannels } });
  },
  addChannelsFromCasts: (casts: FarcasterCastResponse[]) => {
    const currentChannels = get().channels;
    const channels = casts.flatMap((cast) => {
      const channels = [];
      if (cast.channel) {
        channels.push(cast.channel);
      }
      for (const embed of cast.embedCasts) {
        if (embed.channel) {
          channels.push(embed.channel);
        }
      }
      if (cast.parent) {
        if (cast.parent.channel) {
          channels.push(cast.parent.channel);
        }
        for (const embed of cast.parent.embedCasts) {
          if (embed.channel) {
            channels.push(embed.channel);
          }
        }
      }
      return channels;
    });
    const newChannels = channels.reduce(
      (acc, channel) => {
        if (acc[channel.channelId]) return acc;
        acc[channel.channelId] = channel;
        return acc;
      },
      {} as Record<string, Channel>,
    );
    set({ channels: { ...currentChannels, ...newChannels } });
  },
  addChannelsFromNotifications: (notifications: NotificationResponse[]) => {
    const currentChannels = get().channels;
    const channels = notifications.flatMap((notification) => {
      if (!notification.cast) return [];
      const cast = notification.cast;
      const channels = [];
      if (cast.channel) {
        channels.push(cast.channel);
      }
      for (const embed of cast.embedCasts) {
        if (embed.channel) {
          channels.push(embed.channel);
        }
      }
      if (cast.parent) {
        if (cast.parent.channel) {
          channels.push(cast.parent.channel);
        }
        for (const embed of cast.parent.embedCasts) {
          if (embed.channel) {
            channels.push(embed.channel);
          }
        }
      }
      return channels;
    });
    const newChannels = channels.reduce(
      (acc, channel) => {
        if (acc[channel.channelId]) return acc;
        acc[channel.channelId] = channel;
        return acc;
      },
      {} as Record<string, Channel>,
    );
    set({ channels: { ...currentChannels, ...newChannels } });
  },
}));
