import { useCallback } from "react";
import { FarcasterUserV1, List, ListItemType } from "@nook/common/types";
import { useToastController } from "@nook/app-ui";
import { useAuth } from "../context/auth";
import { haptics } from "../utils/haptics";
import { useListStore } from "../store/useListStore";
import { addToList, removeFromList } from "../api/list";

export const useAddUserToList = (list: List, user: FarcasterUserV1) => {
  const { session, login } = useAuth();
  const toast = useToastController();

  const storeList = useListStore((state) => state.lists[list.id]);
  const addUserStore = useListStore((state) => state.addUserToList);
  const removeUserStore = useListStore((state) => state.removeUserFromList);

  const handleAddUser = useCallback(async () => {
    if (!session) {
      login();
      return;
    }
    addUserStore(list, user);
    haptics.impactMedium();
    try {
      await addToList(list.id, {
        listId: list.id,
        type: ListItemType.FID,
        id: user.fid,
      });
      return;
    } catch (e) {
      toast.show("An error occurred. Try again.");
      haptics.notificationError();
    }
    removeUserStore(list, user);
  }, [user, list, addUserStore, removeUserStore, toast, session, login]);

  const handleRemoveUser = useCallback(async () => {
    if (!session) {
      login();
      return;
    }
    removeUserStore(list, user);
    haptics.impactMedium();
    try {
      await removeFromList(list.id, {
        listId: list.id,
        type: ListItemType.FID,
        id: user.fid,
      });
      return;
    } catch (e) {
      toast.show("An error occurred. Try again.");
      haptics.notificationError();
    }
    addUserStore(list, user);
  }, [user, list, removeUserStore, addUserStore, toast, session, login]);

  return {
    addUser: handleAddUser,
    removeUser: handleRemoveUser,
    isAdded:
      storeList?.users?.some((u) => u.fid === user.fid) ??
      list.users?.some((u) => u.fid === user.fid) ??
      false,
  };
};
