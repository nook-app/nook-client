import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";
import { userApi } from "../apis/userApi";
import { farcasterApi } from "../apis/farcasterApi";
import { FarcasterCastResponse, GetEntityResponse } from "@nook/common/types";

const getEntities = (cast: FarcasterCastResponse) => {
  const entities = [];
  entities.push(cast.entity);
  for (const mention of cast.mentions) {
    entities.push(mention.entity);
  }
  if (cast.parent) {
    entities.push(cast.parent.entity);
    for (const mention of cast.parent.mentions) {
      entities.push(mention.entity);
    }
  }
  for (const embed of cast.embedCasts) {
    entities.push(embed.entity);
    for (const mention of embed.mentions) {
      entities.push(mention.entity);
    }
  }
  return entities;
};

const userAdapter = createEntityAdapter({
  selectId: (user: GetEntityResponse) => user.id,
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
        userAdapter.addOne(state, {
          id: action.payload.id,
          farcaster: action.payload.farcaster,
        });
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.followUser.matchFulfilled,
      (state, action) => {
        const user = state.entities[action.payload.id];
        if (user.farcaster.context) {
          user.farcaster.context.following = true;
        }
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.unfollowUser.matchFulfilled,
      (state, action) => {
        const user = state.entities[action.payload.id];
        if (user.farcaster.context) {
          user.farcaster.context.following = false;
        }
      },
    );
  },
});

export const { selectById: selectUserById } = userAdapter.getSelectors(
  (state: RootState) => state.user,
);

export default userSlice.reducer;
