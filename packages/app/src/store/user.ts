import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Nook, TEMPLATE_NOOKS } from "@/constants/nooks";

interface UserState {
  nooks: Nook[];
  activeNook?: Nook;
}

const initialState: UserState = {
  nooks: TEMPLATE_NOOKS,
  activeNook: TEMPLATE_NOOKS[0],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setActiveNook: (state, action: PayloadAction<string>) => {
      state.activeNook = TEMPLATE_NOOKS.find(({ id }) => id === action.payload);
    },
  },
});

export const { setActiveNook } = userSlice.actions;

export default userSlice.reducer;
