import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Nook, TEMPLATE_NOOKS } from "@/constants/nooks";

interface UserState {
  nooks: Nook[];
  activeShelves: Record<string, string>;
}

const initialState: UserState = {
  nooks: TEMPLATE_NOOKS,
  activeShelves: {},
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setNooks: (state, action: PayloadAction<Nook[]>) => {
      state.nooks = action.payload;
    },
    setActiveShelf: (
      state,
      action: PayloadAction<{ nookId: string; shelfId: string }>,
    ) => {
      state.activeShelves[action.payload.nookId] = action.payload.shelfId;
    },
  },
});

export const { setNooks, setActiveShelf } = userSlice.actions;

export default userSlice.reducer;
