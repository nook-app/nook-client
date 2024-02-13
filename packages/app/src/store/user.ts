import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Nook, NookShelf, TEMPLATE_NOOKS } from "@/constants/nooks";

interface UserState {
  nooks: Nook[];
  activeNook: Nook;
  activeShelves: Record<string, NookShelf>;
}

const initialState: UserState = {
  nooks: TEMPLATE_NOOKS,
  activeNook: TEMPLATE_NOOKS[0],
  activeShelves: {},
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setNooks: (state, action: PayloadAction<Nook[]>) => {
      state.nooks = action.payload;
    },
    setActiveNook: (state, action: PayloadAction<string>) => {
      state.activeNook =
        TEMPLATE_NOOKS.find((nook) => nook.id === action.payload) ||
        TEMPLATE_NOOKS[0];
    },
    setActiveShelf: (state, action: PayloadAction<string>) => {
      state.activeShelves[state.activeNook.id] =
        state.activeNook.shelves.find((shelf) => shelf.id === action.payload) ||
        state.activeNook.shelves[0];
    },
  },
});

export const { setNooks, setActiveNook, setActiveShelf } = userSlice.actions;

export default userSlice.reducer;
