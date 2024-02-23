import { TouchableOpacity } from "react-native-gesture-handler";
import { ReactNode, useCallback } from "react";
import { ModalName } from "@/modals/types";
import { useModal } from "@/hooks/useModal";
import { useNooks } from "@/hooks/useNooks";

export const EntityModalButton = ({
  entityId,
  children,
}: { entityId: string; children: ReactNode }) => {
  const { open } = useModal(ModalName.Entity);
  const { activeNook } = useNooks();

  const onPress = useCallback(() => {
    open({ entityId });
  }, [open, entityId]);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={activeNook?.nookId === `entity:${entityId}`}
    >
      {children}
    </TouchableOpacity>
  );
};
