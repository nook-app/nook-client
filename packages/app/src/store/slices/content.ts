import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";
import { userApi } from "../apis/userApi";
import { farcasterApi } from "../apis/farcasterApi";
import { UrlContentResponse } from "@nook/common/types";

const contentAdapter = createEntityAdapter({
  selectId: (content: UrlContentResponse) => content.uri,
});

const contentSlice = createSlice({
  name: "content",
  initialState: contentAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      farcasterApi.endpoints.getCast.matchFulfilled,
      (state, action) => {
        contentAdapter.addMany(state, action.payload.embeds);
        contentAdapter.addMany(
          state,
          action.payload.embedCasts.flatMap((ec) => ec.embeds),
        );
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.getCastReplies.matchFulfilled,
      (state, action) => {
        contentAdapter.addMany(
          state,
          action.payload.data.flatMap((c) => c.embeds),
        );
        contentAdapter.addMany(
          state,
          action.payload.data.flatMap((c) =>
            c.embedCasts.flatMap((ec) => ec.embeds),
          ),
        );
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.getFeed.matchFulfilled,
      (state, action) => {
        contentAdapter.addMany(
          state,
          action.payload.data.flatMap((c) => c.embeds),
        );
        contentAdapter.addMany(
          state,
          action.payload.data.flatMap((c) =>
            c.embedCasts.flatMap((ec) => ec.embeds),
          ),
        );
      },
    );
  },
});

export const { selectById: selectContentById } = contentAdapter.getSelectors(
  (state: RootState) => state.content,
);

export default contentSlice.reducer;
