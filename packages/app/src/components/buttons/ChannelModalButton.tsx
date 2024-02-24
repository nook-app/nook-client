import { ReactNode } from "react";
import { ModalName } from "@/modals/types";
import { useNooks } from "@/hooks/useNooks";
import { ModalButton } from "./ModalButton";

export const ChannelModalButton = ({
  channelId,
  children,
}: { channelId: string; children: ReactNode }) => {
  const { activeNook } = useNooks();

  return (
    <ModalButton
      modalName={ModalName.Channel}
      modalArgs={{ channelId }}
      disabled={activeNook.nookId === `channel:${channelId}`}
    >
      {children}
    </ModalButton>
  );
};
