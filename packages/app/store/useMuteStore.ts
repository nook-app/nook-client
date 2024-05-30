import { create } from "zustand";
import {
  Channel,
  FarcasterCastV1,
  FarcasterUserV1,
  UserSettings,
} from "@nook/common/types";

interface MuteStore {
  users: Record<string, boolean>;
  channels: Record<string, boolean>;
  words: Record<string, boolean>;
  muteUser: (user: FarcasterUserV1) => void;
  muteChannel: (channel: Channel) => void;
  muteWord: (word: string) => void;
  unmuteUser: (user: FarcasterUserV1) => void;
  unmuteChannel: (channel: Channel) => void;
  unmuteWord: (word: string) => void;
  updateFromSettings(settings: UserSettings): void;
  // re-using store for cast deletions
  casts: Record<string, boolean>;
  deleteCast: (cast: FarcasterCastV1) => void;
}

export const useMuteStore = create<MuteStore>((set, get) => ({
  users: {},
  channels: {},
  words: {},
  casts: {},
  muteUser: (user: FarcasterUserV1) => {
    set((state) => ({
      users: { ...state.users, [user.fid]: true },
    }));
  },
  muteChannel: (channel: Channel) => {
    set((state) => ({ channels: { ...state.channels, [channel.url]: true } }));
  },
  muteWord: (word: string) => {
    set((state) => ({ words: { ...state.words, [word]: true } }));
  },
  unmuteUser: (user: FarcasterUserV1) => {
    set((state) => ({
      users: { ...state.users, [user.fid]: false },
    }));
  },
  unmuteChannel: (channel: Channel) => {
    set((state) => ({ channels: { ...state.channels, [channel.url]: false } }));
  },
  unmuteWord: (word: string) => {
    set((state) => ({ words: { ...state.words, [word]: false } }));
  },
  deleteCast: (cast: FarcasterCastV1) => {
    set((state) => ({ casts: { ...state.casts, [cast.hash]: true } }));
  },
  updateFromSettings: (settings: UserSettings) => {
    const { mutedUsers, mutedChannels, mutedWords } = settings;
    set((state) => ({
      users: {
        ...state.users,
        ...mutedUsers.reduce(
          (acc, user) => {
            acc[user] = true;
            return acc;
          },
          {} as Record<string, boolean>,
        ),
      },
      channels: {
        ...state.channels,
        ...mutedChannels.reduce(
          (acc, channel) => {
            acc[channel] = true;
            return acc;
          },
          {} as Record<string, boolean>,
        ),
      },
      words: {
        ...state.words,
        ...mutedWords.reduce(
          (acc, word) => {
            acc[word] = true;
            return acc;
          },
          {} as Record<string, boolean>,
        ),
      },
    }));
  },
}));
