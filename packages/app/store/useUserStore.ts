import { create } from "zustand";
import { FarcasterUser } from "@nook/common/types";

interface UserStore {
  users: Record<string, FarcasterUser>;
  addUsers: (users: FarcasterUser[]) => void;
  followUser: (user: FarcasterUser) => void;
  unfollowUser: (user: FarcasterUser) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: {},
  addUsers: (users: FarcasterUser[]) => {
    const currentUsers = get().users;
    const newUsers = users.reduce(
      (acc, user) => {
        acc[user.username || user.fid] = user;
        return acc;
      },
      {} as Record<string, FarcasterUser>,
    );
    set({ users: { ...currentUsers, ...newUsers } });
  },
  followUser: (user: FarcasterUser) => {
    const storeUser = get().users[user.username || user.fid] ?? user;
    const newUser = {
      ...storeUser,
      engagement: {
        ...storeUser.engagement,
        followers: storeUser.engagement.followers + 1,
      },
      context: {
        followers: storeUser.context?.followers ?? false,
        following: true,
      },
    };

    set((state) => ({
      users: {
        ...state.users,
        [user.username || user.fid]: newUser,
      },
    }));
  },
  unfollowUser: (user: FarcasterUser) => {
    const storeUser = get().users[user.username || user.fid] ?? user;
    const newUser = {
      ...storeUser,
      engagement: {
        ...storeUser.engagement,
        followers: storeUser.engagement.followers - 1,
      },
      context: {
        followers: storeUser.context?.followers ?? false,
        following: false,
      },
    };

    set((state) => ({
      users: {
        ...state.users,
        [user.username || user.fid]: newUser,
      },
    }));
  },
}));
