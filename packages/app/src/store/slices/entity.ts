import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";
import { userApi } from "../apis/userApi";
import { farcasterApi } from "../apis/farcasterApi";
import { EntityResponse } from "@nook/common/types";

const entityAdapter = createEntityAdapter({
  selectId: (entity: EntityResponse) => entity.id,
});

const entitySlice = createSlice({
  name: "entity",
  initialState: entityAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      farcasterApi.endpoints.getCast.matchFulfilled,
      (state, action) => {
        entityAdapter.addOne(state, action.payload.entity);
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.getCastReplies.matchFulfilled,
      (state, action) => {
        entityAdapter.addMany(
          state,
          action.payload.data.map((cast) => cast.entity),
        );
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.getFeed.matchFulfilled,
      (state, action) => {
        console.log(action.payload.data.map((cast) => cast));
        const entities = action.payload.data.map((cast) => cast.entity);
        entityAdapter.addMany(state, entities);
      },
    );
    builder.addMatcher(
      userApi.endpoints.getUser.matchFulfilled,
      (state, action) => {
        entityAdapter.addOne(state, action.payload.entity);
      },
    );
  },
});

export const { selectById: selectEntityById } = entityAdapter.getSelectors(
  (state: RootState) => state.entities,
);

export default entitySlice.reducer;
