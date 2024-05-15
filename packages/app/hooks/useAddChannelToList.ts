import { useCallback } from "react";
import { Channel, ListItemType } from "@nook/common/types";
import { useToastController } from "@nook/app-ui";
import { useAuth } from "../context/auth";
import { haptics } from "../utils/haptics";
import { useListStore } from "../store/useListStore";
import { addToList, removeFromList } from "../api/list";

export const useAddChannelToList = (listId: string, channel: Channel) => {
  const { session, login } = useAuth();
  const toast = useToastController();

  const isAdded = useListStore((state) =>
    state.lists[listId]?.channels?.some((c) => c.url === channel.url),
  );
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
      await addToList(listId, {
        listId,
        type: ListItemType.PARENT_URL,
        id: channel.url,
      });
      addChannelStore(listId, channel);
      return;
    } catch (e) {
      toast.show("An error occurred. Try again.");
      haptics.notificationError();
    }
  }, [channel, listId, addChannelStore, toast, session, login]);

  const handleRemoveChannel = useCallback(async () => {
    if (!session) {
      login();
      return;
    }

    haptics.impactMedium();
    try {
      await removeFromList(listId, {
        listId,
        type: ListItemType.PARENT_URL,
        id: channel.url,
      });
      removeChannelStore(listId, channel);
      return;
    } catch (e) {
      toast.show("An error occurred. Try again.");
      haptics.notificationError();
    }
  }, [channel, listId, removeChannelStore, toast, session, login]);

  return {
    addChannel: handleAddChannel,
    removeChannel: handleRemoveChannel,
    isAdded: isAdded ?? false,
  };
};
