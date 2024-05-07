import { useCallback } from "react";
import { Channel } from "@nook/common/types";
import { useToastController } from "@nook/ui";
import { useAuth } from "../context/auth";
import { useMuteStore } from "../store/useMuteStore";
import { muteChannel, unmuteChannel } from "../server/settings";

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
    updateMute(channel);
    try {
      await muteChannel(channel.url);
      return;
    } catch (e) {
      toast.show("An error occurred. Try again later.");
    }
    updateUnmute(channel);
  }, [channel, updateMute, updateUnmute, toast, session, login]);

  const handleUnmuteChannel = useCallback(async () => {
    if (!session) {
      login();
      return;
    }

    updateUnmute(channel);
    try {
      await unmuteChannel(channel.url);
      return;
    } catch (e) {
      toast.show("An error occurred. Try again later.");
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
