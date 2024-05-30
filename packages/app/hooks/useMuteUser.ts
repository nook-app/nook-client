import { useCallback } from "react";
import { FarcasterUserV1 } from "@nook/common/types";
import { useToastController } from "@nook/app-ui";
import { useAuth } from "../context/auth";
import { useMuteStore } from "../store/useMuteStore";
import { muteUser, unmuteUser } from "../api/settings";
import { haptics } from "../utils/haptics";

export const useMuteUser = (user: FarcasterUserV1) => {
  const { settings, session, login } = useAuth();
  const toast = useToastController();

  const storeMute = useMuteStore(
    (state) => state.users[user.username || user.fid],
  );
  const updateMute = useMuteStore((state) => state.muteUser);
  const updateUnmute = useMuteStore((state) => state.unmuteUser);

  const handleMuteUser = useCallback(async () => {
    if (!session) {
      login();
      return;
    }
    haptics.impactMedium();
    try {
      await muteUser(user.fid);
      updateMute(user);
      return;
    } catch (e) {
      toast.show("An error occurred. Try again.");
      haptics.notificationError();
    }
  }, [user, updateMute, toast, session, login]);

  const handleUnmuteUser = useCallback(async () => {
    if (!session) {
      login();
      return;
    }

    haptics.impactMedium();
    try {
      await unmuteUser(user.fid);
      updateUnmute(user);
      return;
    } catch (e) {
      toast.show("An error occurred. Try again.");
      haptics.notificationError();
    }
  }, [user, updateUnmute, toast, session, login]);

  return {
    muteUser: handleMuteUser,
    unmuteUser: handleUnmuteUser,
    isMuted: storeMute ?? settings?.mutedUsers?.includes(user.fid) ?? false,
  };
};
