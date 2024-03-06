import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";
import { farcasterApi } from "../apis/farcasterApi";
import { FarcasterCastResponse, UrlContentResponse } from "@nook/common/types";

const getContents = (cast: FarcasterCastResponse) => {
  const content = [];
  for (const embed of cast.embeds) {
    content.push(embed);
  }
  if (cast.parent) {
    for (const embed of cast.parent.embeds) {
      content.push(embed);
    }
  }
  for (const embed of cast.embedCasts) {
    for (const e of embed.embeds) {
      content.push(e);
    }
  }
  return content;
};

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
        contentAdapter.addMany(state, getContents(action.payload));
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.getCastReplies.matchFulfilled,
      (state, action) => {
        contentAdapter.addMany(state, action.payload.data.flatMap(getContents));
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.getFeed.matchFulfilled,
      (state, action) => {
        contentAdapter.addMany(state, action.payload.data.flatMap(getContents));
      },
    );
  },
});

export const { selectById: selectContentById } = contentAdapter.getSelectors(
  (state: RootState) => state.content,
);

export default contentSlice.reducer;
