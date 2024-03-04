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
        const casts = [];
        for (const cast of action.payload.data) {
          casts.push(cast);
          casts.push(...cast.embedCasts);
          if (cast.parent) {
            casts.push(cast.parent);
          }
        }
        castAdapter.addMany(state, casts);
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.getFeed.matchFulfilled,
      (state, action) => {
        const casts = [];
        for (const cast of action.payload.data) {
          casts.push(cast);
          casts.push(...cast.embedCasts);
          if (cast.parent) {
            casts.push(cast.parent);
          }
        }
        castAdapter.addMany(state, casts);
      },
    );
  },
});

export const { selectById: selectCastById } = castAdapter.getSelectors(
  (state: RootState) => state.casts,
);

export default contentSlice.reducer;
