import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";
import { FeedItem } from "@flink/api/types";
import { RootState } from ".";

const feedAdapter = createEntityAdapter({
  selectId: (feedItem: FeedItem) => feedItem._id,
});

const feedSlice = createSlice({
  name: "feed",
  initialState: feedAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      api.endpoints.getFeedForFilter.matchFulfilled,
      (state, action) => {
        feedAdapter.upsertMany(state, action.payload);
      },
    );
  },
});

export const { selectById: selectFeedItemById } = feedAdapter.getSelectors(
  (state: RootState) => state.feed,
);

export default feedSlice.reducer;
