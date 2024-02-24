import {
  ChannelModalState,
  ContentModalState,
  EntityModalState,
  ModalName,
} from "@/modals/types";
import { useAppDispatch } from "./useAppDispatch";
import {
  closeAllModals,
  closeModal,
  openModal,
} from "@/store/slices/navigator";
import { useCallback } from "react";

export type ModalState = {
  [ModalName.Entity]: EntityModalState;
  [ModalName.Channel]: ChannelModalState;
  [ModalName.CreatePost]: undefined;
  [ModalName.EnableSigner]: undefined;
  [ModalName.ContentQuotes]: ContentModalState;
  [ModalName.ContentLikes]: ContentModalState;
  [ModalName.ContentReposts]: ContentModalState;
  [ModalName.EntityFollowers]: EntityModalState;
  [ModalName.EntityFollowing]: EntityModalState;
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
