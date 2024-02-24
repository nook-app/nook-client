import { ReactNode } from "react";
import { ModalName } from "@/modals/types";
import { useNooks } from "@/hooks/useNooks";
import { ModalButton } from "./ModalButton";

export const EntityModalButton = ({
  entityId,
  children,
}: { entityId: string; children: ReactNode }) => {
  const { activeNook } = useNooks();

  return (
    <ModalButton
      modalName={ModalName.Entity}
      modalArgs={{ entityId }}
      disabled={activeNook?.nookId === `entity:${entityId}`}
    >
      {children}
    </ModalButton>
  );
};
