import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";
import { RootState } from ".";
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
      api.endpoints.getPanel.matchFulfilled,
      (state, action) => {
        const content = action.payload.data.flatMap((item) => item.contents);
        contentAdapter.addMany(state, content);
      },
    );
    builder.addMatcher(
      api.endpoints.getContentReplies.matchFulfilled,
      (state, action) => {
        const content = action.payload.data.flatMap((item) => item.contents);
        contentAdapter.addMany(state, content);
      },
    );
    builder.addMatcher(
      api.endpoints.getContent.matchFulfilled,
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
