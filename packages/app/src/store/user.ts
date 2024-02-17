import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Nook, NookShelf, TEMPLATE_NOOKS } from "@flink/api/data";

interface UserState {
  nooks: Nook[];
  activeNook?: Nook;
  activeShelves: Record<string, NookShelf>;
}

const initialState: UserState = {
  nooks: [],
  activeNook: undefined,
  activeShelves: {},
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<{ nooks: Nook[] }>) => {
      state.nooks = action.payload.nooks;
      if (action.payload.nooks.length > 0) {
        state.activeNook = action.payload.nooks[0];
      }
    },
    setActiveNook: (state, action: PayloadAction<string>) => {
      state.activeNook =
        TEMPLATE_NOOKS.find((nook) => nook.id === action.payload) ||
        TEMPLATE_NOOKS[0];
    },
    setActiveShelf: (state, action: PayloadAction<string>) => {
      if (!state.activeNook) return;
      state.activeShelves[state.activeNook.id] =
        state.activeNook.shelves.find((shelf) => shelf.id === action.payload) ||
        state.activeNook.shelves[0];
    },
  },
});

export const { setUserData, setActiveNook, setActiveShelf } = userSlice.actions;

export default userSlice.reducer;
