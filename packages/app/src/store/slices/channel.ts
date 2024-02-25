import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { nookApi } from "../apis/nookApi";
import { RootState } from "..";
import { Channel } from "@nook/common/types";

const channelAdapter = createEntityAdapter({
  selectId: (channel: Channel) => channel.contentId,
});

const channelSlice = createSlice({
  name: "channel",
  initialState: channelAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      nookApi.endpoints.getContentFeed.matchFulfilled,
      (state, action) => {
        channelAdapter.addMany(state, action.payload.referencedChannels);
      },
    );
    builder.addMatcher(
      nookApi.endpoints.getContent.matchFulfilled,
      (state, action) => {
        channelAdapter.addMany(state, action.payload.referencedChannels);
      },
    );
    builder.addMatcher(
      nookApi.endpoints.searchChannels.matchFulfilled,
      (state, action) => {
        channelAdapter.addMany(state, action.payload);
      },
    );
  },
});

export const { selectById: selectChannelById } = channelAdapter.getSelectors(
  (state: RootState) => state.channel,
);

export default channelSlice.reducer;
