import { useCallback } from "react";
import { FarcasterUser } from "@nook/common/types";
import { useToastController } from "@nook/ui";
import { useAuth } from "../context/auth";
import { useMuteStore } from "../store/useMuteStore";
import { muteUser, unmuteUser } from "../server/settings";

export const useMuteUser = (user: FarcasterUser) => {
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
    updateMute(user);
    try {
      await muteUser(user.fid);
      return;
    } catch (e) {
      toast.show("An error occurred. Try again later.");
    }
    updateUnmute(user);
  }, [user, updateMute, updateUnmute, toast, session, login]);

  const handleUnmuteUser = useCallback(async () => {
    if (!session) {
      login();
      return;
    }

    updateUnmute(user);
    try {
      await unmuteUser(user.fid);
      return;
    } catch (e) {
      toast.show("An error occurred. Try again later.");
    }
    updateUnmute(user);
  }, [user, updateUnmute, toast, session, login]);

  return {
    muteUser: handleMuteUser,
    unmuteUser: handleUnmuteUser,
    isMuted: storeMute ?? settings?.mutedUsers?.includes(user.fid) ?? false,
  };
};
