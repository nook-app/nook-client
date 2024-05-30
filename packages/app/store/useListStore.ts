import { create } from "zustand";
import { Channel, FarcasterUserV1, List } from "@nook/common/types";

interface ListStore {
  lists: Record<string, List>;
  deletedLists: Record<string, boolean>;
  addLists: (lists: List[]) => void;
  updateList: (list: List) => void;
  deleteList: (listId: string) => void;
  addUserToList: (list: List, user: FarcasterUserV1) => void;
  removeUserFromList: (list: List, user: FarcasterUserV1) => void;
  addChannelToList: (list: List, channel: Channel) => void;
  removeChannelFromList: (list: List, channel: Channel) => void;
}

export const useListStore = create<ListStore>((set, get) => ({
  lists: {},
  deletedLists: {},
  addLists: (lists: List[]) => {
    const currentLists = get().lists;
    const newLists = lists.reduce(
      (acc, list) => {
        if (acc[list.id]) return acc;
        acc[list.id] = list;
        return acc;
      },
      {} as Record<string, List>,
    );
    set({ lists: { ...currentLists, ...newLists } });
  },
  updateList: (list: List) => {
    set((state) => ({
      lists: { ...state.lists, [list.id]: list },
    }));
  },
  deleteList: (listId: string) => {
    set((state) => ({
      deletedLists: { ...state.deletedLists, [listId]: true },
    }));
  },
  addUserToList: (list: List, user: FarcasterUserV1) => {
    let currentList = get().lists[list.id];
    if (!currentList) {
      currentList = list;
    }
    const users = currentList.users || [];
    if (users.some((u) => u.fid === user.fid)) return;
    set({
      lists: {
        ...get().lists,
        [list.id]: {
          ...currentList,
          itemCount: currentList.itemCount + 1,
          users: [...users, user],
        },
      },
    });
  },
  removeUserFromList: (list: List, user: FarcasterUserV1) => {
    let currentList = get().lists[list.id];
    if (!currentList) {
      currentList = list;
    }
    const users = currentList.users || [];
    set({
      lists: {
        ...get().lists,
        [list.id]: {
          ...currentList,
          itemCount: currentList.itemCount - 1,
          users: users.filter((u) => u.fid !== user.fid),
        },
      },
    });
  },
  addChannelToList: (list: List, channel: Channel) => {
    let currentList = get().lists[list.id];
    if (!currentList) {
      currentList = list;
    }
    const channels = currentList.channels || [];
    if (channels.some((c) => c.url === channel.url)) return;
    set({
      lists: {
        ...get().lists,
        [list.id]: {
          ...currentList,
          itemCount: currentList.itemCount + 1,
          channels: [...channels, channel],
        },
      },
    });
  },
  removeChannelFromList: (list: List, channel: Channel) => {
    let currentList = get().lists[list.id];
    if (!currentList) {
      currentList = list;
    }
    const channels = currentList.channels || [];
    set({
      lists: {
        ...get().lists,
        [list.id]: {
          ...currentList,
          itemCount: currentList.itemCount - 1,
          channels: channels.filter((c) => c.url !== channel.url),
        },
      },
    });
  },
}));
