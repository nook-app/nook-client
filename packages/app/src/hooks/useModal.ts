import { ChannelModalState, EntityModalState, ModalName } from "@/modals/types";
import { useAppDispatch } from "./useAppDispatch";
import { closeModal, openModal } from "@/store/slices/navigator";
import { useCallback } from "react";

type ModalState = {
  [ModalName.Entity]: EntityModalState;
  [ModalName.Channel]: ChannelModalState;
  [ModalName.CreatePost]: undefined;
  [ModalName.EnableSigner]: undefined;
};

export const useModal = (modalName: ModalName) => {
  const dispatch = useAppDispatch();

  const open = useCallback(
    (initialState?: ModalState[typeof modalName]) =>
      dispatch(openModal({ name: modalName, initialState })),
    [dispatch, modalName],
  );

  const close = useCallback(
    () => dispatch(closeModal({ name: modalName })),
    [dispatch, modalName],
  );

  return {
    open,
    close,
  };
};
