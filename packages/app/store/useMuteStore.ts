import { create } from "zustand";
import { Channel, FarcasterCast, FarcasterUser } from "@nook/common/types";

interface MuteStore {
  users: Record<string, boolean>;
  channels: Record<string, boolean>;
  words: Record<string, boolean>;
  muteUser: (user: FarcasterUser) => void;
  muteChannel: (channel: Channel) => void;
  muteWord: (word: string) => void;
  unmuteUser: (user: FarcasterUser) => void;
  unmuteChannel: (channel: Channel) => void;
  unmuteWord: (word: string) => void;
  // re-using store for cast deletions
  casts: Record<string, boolean>;
  deleteCast: (cast: FarcasterCast) => void;
}

export const useMuteStore = create<MuteStore>((set, get) => ({
  users: {},
  channels: {},
  words: {},
  casts: {},
  muteUser: (user: FarcasterUser) => {
    set((state) => ({
      users: { ...state.users, [user.username || user.fid]: true },
    }));
  },
  muteChannel: (channel: Channel) => {
    set((state) => ({ channels: { ...state.channels, [channel.url]: true } }));
  },
  muteWord: (word: string) => {
    set((state) => ({ words: { ...state.words, [word]: true } }));
  },
  unmuteUser: (user: FarcasterUser) => {
    set((state) => ({
      users: { ...state.users, [user.username || user.fid]: false },
    }));
  },
  unmuteChannel: (channel: Channel) => {
    set((state) => ({ channels: { ...state.channels, [channel.url]: false } }));
  },
  unmuteWord: (word: string) => {
    set((state) => ({ words: { ...state.words, [word]: false } }));
  },
  deleteCast: (cast: FarcasterCast) => {
    set((state) => ({ casts: { ...state.casts, [cast.hash]: true } }));
  },
}));
