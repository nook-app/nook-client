import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NavigatorState {
  isDrawerOpen: boolean;
  activeEntityModal?: string;
  activeChannelModal?: string;
}

const initialState: NavigatorState = {
  isDrawerOpen: false,
};

export const navigatorSlice = createSlice({
  name: "navigator",
  initialState,
  reducers: {
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isDrawerOpen = action.payload;
    },
    setActiveEntityModal: (
      state,
      action: PayloadAction<string | undefined>,
    ) => {
      state.activeEntityModal = action.payload;
    },
    setActiveChannelModal: (
      state,
      action: PayloadAction<string | undefined>,
    ) => {
      state.activeChannelModal = action.payload;
    },
  },
});

export const { setDrawerOpen, setActiveEntityModal, setActiveChannelModal } =
  navigatorSlice.actions;

export default navigatorSlice.reducer;
