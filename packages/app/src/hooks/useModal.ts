import { ContentModalState, ModalName } from "@/modals/types";
import { useAppDispatch } from "./useAppDispatch";
import {
  closeAllModals,
  closeModal,
  openModal,
} from "@/store/slices/navigator";
import { useCallback } from "react";
import { useAppSelector } from "./useAppSelector";

export type ModalState = {
  [ModalName.CreatePost]: undefined;
  [ModalName.EnableSigner]: undefined;
  [ModalName.Content]: ContentModalState;
};

export const useModal = (modalName: ModalName) => {
  const dispatch = useAppDispatch();
  const state: ModalState[ModalName] = useAppSelector(
    (state) => state.navigator.modals[modalName],
  )?.initialState;

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
    state,
  };
};
