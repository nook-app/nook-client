import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { api } from "./api";
import { RootState } from ".";
import { Entity } from "@flink/common/types";

const entityAdapter = createEntityAdapter({
  selectId: (entity: Entity) => entity._id.toString(),
});

const entitySlice = createSlice({
  name: "entity",
  initialState: entityAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      api.endpoints.getPanel.matchFulfilled,
      (state, action) => {
        const entities = action.payload.data.flatMap((item) => item.entities);
        entityAdapter.addMany(state, entities);
      },
    );
    builder.addMatcher(
      api.endpoints.getContentReplies.matchFulfilled,
      (state, action) => {
        const entities = action.payload.data.flatMap((item) => item.entities);
        entityAdapter.addMany(state, entities);
      },
    );
    builder.addMatcher(
      api.endpoints.getContent.matchFulfilled,
      (state, action) => {
        entityAdapter.addMany(state, action.payload.entities);
      },
    );
    builder.addMatcher(
      api.endpoints.getEntities.matchFulfilled,
      (state, action) => {
        entityAdapter.addMany(state, action.payload.data);
      },
    );
    builder.addMatcher(
      api.endpoints.getUser.matchFulfilled,
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
