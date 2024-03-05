import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";
import { userApi } from "../apis/userApi";
import { farcasterApi } from "../apis/farcasterApi";
import {
  FarcasterCastResponse,
  FarcasterUserWithContext,
} from "@nook/common/types";

const getEntities = (cast: FarcasterCastResponse) => {
  const entities = [];
  entities.push(cast.user);
  for (const mention of cast.mentions) {
    entities.push(mention.user);
  }
  if (cast.parent) {
    entities.push(cast.parent.user);
  }
  return entities;
};

const userAdapter = createEntityAdapter({
  selectId: (entity: FarcasterUserWithContext) => entity.fid,
});

const userSlice = createSlice({
  name: "user",
  initialState: userAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      farcasterApi.endpoints.getCast.matchFulfilled,
      (state, action) => {
        userAdapter.addMany(state, getEntities(action.payload));
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.getCastReplies.matchFulfilled,
      (state, action) => {
        userAdapter.addMany(
          state,
          action.payload.data.flatMap((c) => getEntities(c)),
        );
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.getFeed.matchFulfilled,
      (state, action) => {
        userAdapter.addMany(
          state,
          action.payload.data.flatMap((c) => getEntities(c)),
        );
      },
    );
    builder.addMatcher(
      userApi.endpoints.getUser.matchFulfilled,
      (state, action) => {
        userAdapter.addOne(state, action.payload.user);
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.followUser.matchFulfilled,
      (state, action) => {
        const user = state.entities[action.payload.id];
        if (user.context) {
          user.context.following = true;
        }
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.unfollowUser.matchFulfilled,
      (state, action) => {
        const user = state.entities[action.payload.id];
        if (user.context) {
          user.context.following = false;
        }
      },
    );
  },
});

export const { selectById: selectUserById } = userAdapter.getSelectors(
  (state: RootState) => state.user,
);

export default userSlice.reducer;
