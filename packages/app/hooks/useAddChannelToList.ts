import { useCallback } from "react";
import { Channel, List, ListItemType } from "@nook/common/types";
import { useToastController } from "@nook/app-ui";
import { useAuth } from "../context/auth";
import { haptics } from "../utils/haptics";
import { useListStore } from "../store/useListStore";
import { addToList, removeFromList } from "../api/list";

export const useAddChannelToList = (list: List, channel: Channel) => {
  const { session, login } = useAuth();
  const toast = useToastController();

  const storeList = useListStore((state) => state.lists[list.id]);
  const addChannelStore = useListStore((state) => state.addChannelToList);
  const removeChannelStore = useListStore(
    (state) => state.removeChannelFromList,
  );

  const handleAddChannel = useCallback(async () => {
    if (!session) {
      login();
      return;
    }
    haptics.impactMedium();
    try {
      await addToList(list.id, {
        listId: list.id,
        type: ListItemType.PARENT_URL,
        id: channel.url,
      });
      addChannelStore(list, channel);
      return;
    } catch (e) {
      toast.show("An error occurred. Try again.");
      haptics.notificationError();
    }
  }, [channel, list, addChannelStore, toast, session, login]);

  const handleRemoveChannel = useCallback(async () => {
    if (!session) {
      login();
      return;
    }

    haptics.impactMedium();
    try {
      await removeFromList(list.id, {
        listId: list.id,
        type: ListItemType.PARENT_URL,
        id: channel.url,
      });
      removeChannelStore(list, channel);
      return;
    } catch (e) {
      toast.show("An error occurred. Try again.");
      haptics.notificationError();
    }
  }, [channel, list, removeChannelStore, toast, session, login]);

  return {
    addChannel: handleAddChannel,
    removeChannel: handleRemoveChannel,
    isAdded:
      storeList?.channels?.some((c) => c.url === channel.url) ??
      list.channels?.some((c) => c.url === channel.url) ??
      false,
  };
};
