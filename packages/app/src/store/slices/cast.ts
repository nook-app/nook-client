import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";
import { farcasterApi } from "../apis/farcasterApi";
import { FarcasterCastResponseWithContext } from "@nook/common/types";

const castAdapter = createEntityAdapter({
  selectId: (content: FarcasterCastResponseWithContext) => content.hash,
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
      farcasterApi.endpoints.getCastReplies.matchFulfilled,
      (state, action) => {
        castAdapter.addMany(state, action.payload.data);
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
