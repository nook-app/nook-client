import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";
import { RootState } from ".";
import { Content, ContentData, Entity } from "@flink/common/types";

export type ContentItem = Content<ContentData> & {
  entity: Entity;
  entityMap: Record<string, Entity>;
  contentMap: Record<string, Content<ContentData>>;
};

const contentAdapter = createEntityAdapter({
  selectId: (content: Content<ContentData>) => content.contentId,
});

const contentSlice = createSlice({
  name: "content",
  initialState: contentAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      api.endpoints.getFeedForFilter.matchFulfilled,
      (state, action) => {
        const contents = action.payload.flatMap((feedItem) =>
          Object.values(feedItem.contentMap).map((content) => ({
            ...content,
            entity:
              "entityId" in content.data
                ? feedItem.entityMap[content.data.entityId.toString()]
                : undefined,
            entityMap: feedItem.entityMap,
            contentMap: feedItem.contentMap,
          })),
        );
        contentAdapter.upsertMany(state, contents);
        contentAdapter.updateMany;
      },
    );
  },
});

export const { selectById: selectContentById } = contentAdapter.getSelectors(
  (state: RootState) => state.content,
);

export default contentSlice.reducer;
