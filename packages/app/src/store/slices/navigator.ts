import { ModalName, ModalsState } from "@/modals/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ModalParams = {
  name: ModalName;
  initialState: undefined;
};

type NavigatorState = {
  isDrawerOpen: boolean;
  modals: ModalsState;
};

const initialState: NavigatorState = {
  isDrawerOpen: false,
  modals: {
    [ModalName.CreatePost]: {
      isOpen: false,
      initialState: undefined,
    },
    [ModalName.EnableSigner]: {
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
    openModal: (state, action: PayloadAction<ModalParams>) => {
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
