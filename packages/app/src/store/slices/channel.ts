import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";
import { farcasterApi } from "../apis/farcasterApi";
import { Channel } from "@nook/common/prisma/nook";

const channelAdapter = createEntityAdapter({
  selectId: (channel: Channel) => channel.id,
});

const channelSlice = createSlice({
  name: "channel",
  initialState: channelAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      farcasterApi.endpoints.getCast.matchFulfilled,
      (state, action) => {
        if (action.payload.channel) {
          channelAdapter.addOne(state, action.payload.channel);
        }
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.getFeed.matchFulfilled,
      (state, action) => {
        const channels = action.payload.data
          .map((cast) => cast.channel)
          .filter(Boolean) as Channel[];
        channelAdapter.addMany(state, channels);
      },
    );
  },
});

export const { selectById: selectChannelById } = channelAdapter.getSelectors(
  (state: RootState) => state.channel,
);

export default channelSlice.reducer;
