import { ModalName } from "@/modals/types";
import { useAppDispatch } from "./useAppDispatch";
import {
  closeAllModals,
  closeModal,
  openModal,
} from "@/store/slices/navigator";
import { useCallback } from "react";

export type ModalState = {
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

  const closeAll = useCallback(() => {
    dispatch(closeAllModals());
  }, [dispatch]);

  return {
    open,
    close,
    closeAll,
  };
};
