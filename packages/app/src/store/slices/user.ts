import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@nook/common/prisma/nook";
import { Entity, Nook } from "@nook/common/types";
import { userApi } from "../apis/userApi";
import { generateHomeNook } from "../utils";

interface UserState {
  user?: User;
  entity?: Entity;
  nooks: Nook[];
  theme: string;
  activeNook?: string;
  activeShelves: Record<string, string>;
}

const initialState: UserState = {
  user: undefined,
  nooks: [],
  activeShelves: {},
  theme: "gray",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setActiveNook: (state, action: PayloadAction<string>) => {
      state.activeNook = action.payload;
    },
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
    },
    setActiveShelf: (
      state,
      action: PayloadAction<{ nookId: string; shelfId: string }>,
    ) => {
      state.activeShelves[action.payload.nookId] = action.payload.shelfId;
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
        state.activeNook = "home";
        state.theme = "gray";
      },
    );
  },
});

export const { setTheme, setActiveNook, setActiveShelf, setSignerEnabled } =
  userSlice.actions;

export default userSlice.reducer;
