import { TouchableOpacity } from "react-native-gesture-handler";
import { ReactNode, useCallback } from "react";
import { ModalName } from "@/modals/types";
import { ModalState, useModal } from "@/hooks/useModal";

export const ModalButton = ({
  modalName,
  modalArgs,
  children,
  disabled,
}: {
  modalName: ModalName;
  modalArgs: ModalState[typeof modalName];
  children: ReactNode;
  disabled?: boolean;
}) => {
  const { open } = useModal(modalName);

  const onPress = useCallback(() => {
    open(modalArgs);
  }, [open, modalArgs]);

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      {children}
    </TouchableOpacity>
  );
};
