import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { nookApi } from "../apis/nookApi";
import { RootState } from "..";
import { FarcasterCastResponse } from "@nook/api/types";
import { farcasterApi } from "../apis/farcasterApi";

const castAdapter = createEntityAdapter({
  selectId: (content: FarcasterCastResponse) => content.hash,
});

const contentSlice = createSlice({
  name: "content",
  initialState: castAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      farcasterApi.endpoints.getCast.matchFulfilled,
      (state, action) => {
        castAdapter.addOne(state, action.payload);
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.getFeed.matchFulfilled,
      (state, action) => {
        castAdapter.addMany(state, action.payload.data);
      },
    );
  },
});

export const { selectById: selectCastById } = castAdapter.getSelectors(
  (state: RootState) => state.content,
);

export default contentSlice.reducer;
