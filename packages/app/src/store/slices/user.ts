import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@flink/common/prisma/nook";
import { Entity, Nook, NookShelf } from "@flink/common/types";
import { userApi } from "../apis/userApi";

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
    setActiveNook: (state, action: PayloadAction<string>) => {
      state.activeNook = state.nooks.find(
        (nook) => nook.slug === action.payload,
      );
    },
    setActiveShelf: (state, action: PayloadAction<string>) => {
      if (!state.activeNook) return;
      state.activeShelves[state.activeNook.slug] =
        state.activeNook.shelves.find(
          (shelf) => shelf.slug === action.payload,
        ) || state.activeNook.shelves[0];
    },
    setSignerEnabled: (state, action: PayloadAction<boolean>) => {
      if (!state.user) return;
      state.user.signerEnabled = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      userApi.endpoints.getUser.matchFulfilled,
      (state, action) => {
        state.user = action.payload.user;
        state.entity = action.payload.entity;
        state.nooks = action.payload.nooks;
        state.activeNook = action.payload.nooks[0];
        if (state.activeNook) {
          state.activeShelves[state.activeNook.slug] =
            state.activeNook.shelves[0];
        }
      },
    );
  },
});

export const { setActiveNook, setActiveShelf, setSignerEnabled } =
  userSlice.actions;

export default userSlice.reducer;
