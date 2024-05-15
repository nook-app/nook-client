import { useCallback } from "react";
import { FarcasterUser, ListItemType } from "@nook/common/types";
import { useToastController } from "@nook/app-ui";
import { useAuth } from "../context/auth";
import { haptics } from "../utils/haptics";
import { useListStore } from "../store/useListStore";
import { addToList, removeFromList } from "../api/list";

export const useAddUserToList = (listId: string, user: FarcasterUser) => {
  const { session, login } = useAuth();
  const toast = useToastController();

  const isAdded = useListStore((state) =>
    state.lists[listId]?.users?.some((u) => u.fid === user.fid),
  );
  const addUserStore = useListStore((state) => state.addUserToList);
  const removeUserStore = useListStore((state) => state.removeUserFromList);

  const handleAddUser = useCallback(async () => {
    if (!session) {
      login();
      return;
    }
    addUserStore(listId, user);
    haptics.impactMedium();
    try {
      await addToList(listId, {
        listId,
        type: ListItemType.FID,
        id: user.fid,
      });
      return;
    } catch (e) {
      toast.show("An error occurred. Try again.");
      haptics.notificationError();
    }
    removeUserStore(listId, user);
  }, [user, listId, addUserStore, removeUserStore, toast, session, login]);

  const handleRemoveUser = useCallback(async () => {
    if (!session) {
      login();
      return;
    }
    removeUserStore(listId, user);
    haptics.impactMedium();
    try {
      await removeFromList(listId, {
        listId,
        type: ListItemType.FID,
        id: user.fid,
      });
      return;
    } catch (e) {
      toast.show("An error occurred. Try again.");
      haptics.notificationError();
    }
    addUserStore(listId, user);
  }, [user, listId, removeUserStore, addUserStore, toast, session, login]);

  return {
    addUser: handleAddUser,
    removeUser: handleRemoveUser,
    isAdded: isAdded ?? false,
  };
};
