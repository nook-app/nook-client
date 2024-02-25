import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { nookApi } from "../apis/nookApi";
import { RootState } from "..";
import { userApi } from "../apis/userApi";
import { EntityWithContext } from "@nook/api/types";

const entityAdapter = createEntityAdapter({
  selectId: (entity: EntityWithContext) => entity.entity._id.toString(),
});

const entitySlice = createSlice({
  name: "entity",
  initialState: entityAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      nookApi.endpoints.getActionsFeed.matchFulfilled,
      (state, action) => {
        entityAdapter.addMany(state, action.payload.referencedEntities);
      },
    );
    builder.addMatcher(
      nookApi.endpoints.getContentFeed.matchFulfilled,
      (state, action) => {
        entityAdapter.addMany(state, action.payload.referencedEntities);
      },
    );
    builder.addMatcher(
      nookApi.endpoints.getContent.matchFulfilled,
      (state, action) => {
        entityAdapter.addMany(state, action.payload.referencedEntities);
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
        entityAdapter.addOne(state, {
          entity: action.payload.entity,
          context: {
            following: false,
          },
        });
      },
    );
  },
});

export const { selectById: selectEntityById } = entityAdapter.getSelectors(
  (state: RootState) => state.entities,
);

export default entitySlice.reducer;
