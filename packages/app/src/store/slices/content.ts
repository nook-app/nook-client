import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { nookApi } from "../apis/nookApi";
import { RootState } from "..";
import { ContentWithContext } from "@nook/api/types";

const contentAdapter = createEntityAdapter({
  selectId: (content: ContentWithContext) => content.content.contentId,
});

const contentSlice = createSlice({
  name: "content",
  initialState: contentAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      nookApi.endpoints.getActionsFeed.matchFulfilled,
      (state, action) => {
        contentAdapter.addMany(state, action.payload.referencedContents);
      },
    );
    builder.addMatcher(
      nookApi.endpoints.getContentFeed.matchFulfilled,
      (state, action) => {
        contentAdapter.addMany(state, action.payload.referencedContents);
      },
    );
    builder.addMatcher(
      nookApi.endpoints.getContent.matchFulfilled,
      (state, action) => {
        contentAdapter.addMany(state, action.payload.referencedContents);
      },
    );
  },
});

export const { selectById: selectContentById } = contentAdapter.getSelectors(
  (state: RootState) => state.content,
);

export default contentSlice.reducer;
