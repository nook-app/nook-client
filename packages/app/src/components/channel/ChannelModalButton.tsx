import { TouchableOpacity } from "react-native-gesture-handler";
import { ReactNode, useCallback } from "react";
import { ModalName } from "@/modals/types";
import { useModal } from "@/hooks/useModal";
import { useNooks } from "@/hooks/useNooks";

export const ChannelModalButton = ({
  channelId,
  children,
}: { channelId: string; children: ReactNode }) => {
  const { open } = useModal(ModalName.Channel);
  const { activeNook } = useNooks();

  const onPress = useCallback(() => {
    open({ channelId });
  }, [open, channelId]);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={activeNook.nookId === `channel:${channelId}`}
    >
      {children}
    </TouchableOpacity>
  );
};
