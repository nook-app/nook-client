import { create } from "zustand";
import {
  FarcasterCastResponse,
  FarcasterUser,
  NotificationResponse,
  List,
} from "@nook/common/types";

interface UserStore {
  users: Record<string, FarcasterUser>;
  addUsers: (users: FarcasterUser[]) => void;
  addUsersFromCasts: (casts: FarcasterCastResponse[]) => void;
  addUsersFromNotifications: (notifications: NotificationResponse[]) => void;
  addUsersFromLists(lists: List[]): void;
  followUser: (user: FarcasterUser) => void;
  unfollowUser: (user: FarcasterUser) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: {},
  addUsers: (users: FarcasterUser[]) => {
    const currentUsers = get().users;
    const newUsers = users.reduce(
      (acc, user) => {
        if (acc[user.username || user.fid]) return acc;
        acc[user.username || user.fid] = user;
        return acc;
      },
      {} as Record<string, FarcasterUser>,
    );
    set({ users: { ...currentUsers, ...newUsers } });
  },
  addUsersFromCasts: (casts: FarcasterCastResponse[]) => {
    const currentUsers = get().users;
    const users = casts.flatMap((cast) => {
      const users = [cast.user];
      for (const embed of cast.embedCasts) {
        users.push(embed.user);
      }
      for (const mention of cast.mentions) {
        users.push(mention.user);
      }
      if (cast.parent) {
        users.push(cast.parent.user);
        for (const embed of cast.parent.embedCasts) {
          users.push(embed.user);
        }
        for (const mention of cast.parent.mentions) {
          users.push(mention.user);
        }
      }
      return users;
    });
    const newUsers = users.reduce(
      (acc, user) => {
        if (currentUsers[user.username || user.fid]) return acc;
        if (acc[user.username || user.fid]) return acc;
        acc[user.username || user.fid] = user;
        return acc;
      },
      {} as Record<string, FarcasterUser>,
    );
    set({ users: { ...currentUsers, ...newUsers } });
  },
  addUsersFromNotifications: (notifications: NotificationResponse[]) => {
    const currentUsers = get().users;
    const users = notifications.flatMap((notification) => {
      const users = [...(notification.users || [])];
      if (!notification.cast) return users;
      const cast = notification.cast;
      for (const embed of cast.embedCasts) {
        users.push(embed.user);
      }
      for (const mention of cast.mentions) {
        users.push(mention.user);
      }
      if (cast.parent) {
        users.push(cast.parent.user);
        for (const embed of cast.parent.embedCasts) {
          users.push(embed.user);
        }
        for (const mention of cast.parent.mentions) {
          users.push(mention.user);
        }
      }
      return users;
    });
    const newUsers = users.reduce(
      (acc, user) => {
        if (currentUsers[user.username || user.fid]) return acc;
        if (acc[user.username || user.fid]) return acc;
        acc[user.username || user.fid] = user;
        return acc;
      },
      {} as Record<string, FarcasterUser>,
    );
    set({ users: { ...currentUsers, ...newUsers } });
  },
  addUsersFromLists: (lists: List[]) => {
    const currentUsers = get().users;
    const users = lists.flatMap((list) => list.users);
    const newUsers = users.reduce(
      (acc, user) => {
        if (!user) return acc;
        if (acc[user.username || user.fid]) return acc;
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
