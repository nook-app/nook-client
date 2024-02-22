import { ModalName, ModalsState } from "@/modals/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type EntityModalParams = {
  name: typeof ModalName.Entity;
  initialState: {
    entityId: string;
  };
};

type ChannelModalParams = {
  name: typeof ModalName.Channel;
  initialState: {
    channelId: string;
  };
};

type NavigatorState = {
  isDrawerOpen: boolean;
  modals: ModalsState;
};

const initialState: NavigatorState = {
  isDrawerOpen: false,
  modals: {
    [ModalName.Entity]: {
      isOpen: false,
      initialState: undefined,
    },
    [ModalName.Channel]: {
      isOpen: false,
      initialState: undefined,
    },
  },
};

export const navigatorSlice = createSlice({
  name: "navigator",
  initialState,
  reducers: {
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isDrawerOpen = action.payload;
    },
    openModal: (
      state,
      action: PayloadAction<EntityModalParams | ChannelModalParams>,
    ) => {
      const { name, initialState } = action.payload;
      state.modals[name].isOpen = true;
      state.modals[name].initialState = initialState;
    },
    closeModal: (state, action: PayloadAction<{ name: keyof ModalsState }>) => {
      state.modals[action.payload.name].isOpen = false;
      state.modals[action.payload.name].initialState = undefined;
    },
    closeAllModals: (state) => {
      for (const modal of Object.values(state.modals)) {
        modal.isOpen = false;
        modal.initialState = undefined;
      }
    },
  },
});

export const { setDrawerOpen, openModal, closeModal, closeAllModals } =
  navigatorSlice.actions;

export default navigatorSlice.reducer;
