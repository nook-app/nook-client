import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { nookApi } from "../apis/nookApi";
import { RootState } from "..";
import { Content, ContentData } from "@flink/common/types";

const contentAdapter = createEntityAdapter({
  selectId: (content: Content<ContentData>) => content.contentId,
});

const contentSlice = createSlice({
  name: "content",
  initialState: contentAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      nookApi.endpoints.getContentFeed.matchFulfilled,
      (state, action) => {
        const content = action.payload.data.flatMap((item) => item.contents);
        contentAdapter.addMany(state, content);
      },
    );
    builder.addMatcher(
      nookApi.endpoints.getContent.matchFulfilled,
      (state, action) => {
        contentAdapter.addMany(state, action.payload.contents);
      },
    );
  },
});

export const { selectById: selectContentById } = contentAdapter.getSelectors(
  (state: RootState) => state.content,
);

export default contentSlice.reducer;
