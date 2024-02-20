import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface NavigatorState {
  isDrawerOpen: boolean;
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
  },
});

export const { setDrawerOpen } = navigatorSlice.actions;

export default navigatorSlice.reducer;
