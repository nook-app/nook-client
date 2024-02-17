import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Nook, NookShelf, TEMPLATE_NOOKS } from "@flink/api/data";
import { GetUserResponse } from "@flink/api/types";
import { User } from "@flink/common/prisma/nook";
import { Entity } from "@flink/common/types";

interface UserState {
  user?: User;
  entity?: Entity;
  nooks: Nook[];
  activeNook?: Nook;
  activeShelves: Record<string, NookShelf>;
}

const initialState: UserState = {
  user: undefined,
  nooks: [],
  activeNook: undefined,
  activeShelves: {},
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUserData: (state, action: PayloadAction<GetUserResponse>) => {
      state.nooks = action.payload.nooks;
      if (action.payload.nooks.length > 0) {
        state.activeNook = action.payload.nooks[0];
      }
      state.user = action.payload.user;
    },
    // TODO: Merge with setUserData
    setEntity: (state, action: PayloadAction<Entity>) => {
      state.entity = action.payload;
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
    setSignerEnabled: (state, action: PayloadAction<boolean>) => {
      if (!state.user) return;
      state.user.signerEnabled = action.payload;
    },
  },
});

export const {
  setUserData,
  setEntity,
  setActiveNook,
  setActiveShelf,
  setSignerEnabled,
} = userSlice.actions;

export default userSlice.reducer;
