import { useCallback } from "react";
import { Channel } from "@nook/common/types";
import { useToastController } from "@nook/app-ui";
import { useAuth } from "../context/auth";
import { useMuteStore } from "../store/useMuteStore";
import { muteChannel, unmuteChannel } from "../api/settings";
import { haptics } from "../utils/haptics";

export const useMuteChannel = (channel: Channel) => {
  const { settings, session, login } = useAuth();
  const toast = useToastController();

  const storeMute = useMuteStore((state) => state.channels[channel.url]);
  const updateMute = useMuteStore((state) => state.muteChannel);
  const updateUnmute = useMuteStore((state) => state.unmuteChannel);

  const handleMuteChannel = useCallback(async () => {
    if (!session) {
      login();
      return;
    }
    haptics.impactMedium();
    try {
      await muteChannel(channel.url);
      updateMute(channel);
      return;
    } catch (e) {
      toast.show("An error occurred. Try again.");
      haptics.notificationError();
    }
    updateUnmute(channel);
  }, [channel, updateMute, updateUnmute, toast, session, login]);

  const handleUnmuteChannel = useCallback(async () => {
    if (!session) {
      login();
      return;
    }

    haptics.impactMedium();
    try {
      await unmuteChannel(channel.url);
      updateUnmute(channel);
      return;
    } catch (e) {
      toast.show("An error occurred. Try again.");
      haptics.notificationError();
    }
    updateUnmute(channel);
  }, [channel, updateUnmute, toast, session, login]);

  return {
    muteChannel: handleMuteChannel,
    unmuteChannel: handleUnmuteChannel,
    isMuted:
      storeMute ?? settings?.mutedChannels?.includes(channel.url) ?? false,
  };
};
