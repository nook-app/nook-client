import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";
import { RootState } from ".";
import { ContentData } from "@flink/common/types";
import { ContentFeedItem } from "@flink/api/types";

const contentAdapter = createEntityAdapter({
  selectId: (content: ContentFeedItem<ContentData>) => content.contentId,
});

const contentSlice = createSlice({
  name: "content",
  initialState: contentAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      api.endpoints.getContentFeed.matchFulfilled,
      (state, action) => {
        const content = action.payload.flatMap((item) => {
          return Object.values(item.contentMap).map((content) => {
            return {
              ...content,
              entityMap: item.entityMap,
              contentMap: item.contentMap,
            } as ContentFeedItem<ContentData>;
          }) as ContentFeedItem<ContentData>[];
        });
        contentAdapter.upsertMany(state, content);
      },
    );
  },
});

export const { selectById: selectContentById } = contentAdapter.getSelectors(
  (state: RootState) => state.content,
);

export default contentSlice.reducer;
