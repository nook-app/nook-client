import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { nookApi } from "../apis/nookApi";
import { RootState } from "..";
import { Entity } from "@nook/common/types";
import { userApi } from "../apis/userApi";

const entityAdapter = createEntityAdapter({
  selectId: (entity: Entity) => entity._id.toString(),
});

const entitySlice = createSlice({
  name: "entity",
  initialState: entityAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      nookApi.endpoints.getActionsFeed.matchFulfilled,
      (state, action) => {
        const entities = action.payload.data.flatMap((item) => item.entities);
        entityAdapter.addMany(state, entities);
      },
    );
    builder.addMatcher(
      nookApi.endpoints.getContentFeed.matchFulfilled,
      (state, action) => {
        const entities = action.payload.data.flatMap((item) => item.entities);
        entityAdapter.addMany(state, entities);
      },
    );
    builder.addMatcher(
      nookApi.endpoints.getContent.matchFulfilled,
      (state, action) => {
        entityAdapter.addMany(state, action.payload.entities);
      },
    );
    builder.addMatcher(
      nookApi.endpoints.getEntities.matchFulfilled,
      (state, action) => {
        entityAdapter.addMany(state, action.payload);
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
