import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";
import { userApi } from "../apis/userApi";
import { farcasterApi } from "../apis/farcasterApi";
import {
  EntityResponse,
  FarcasterCastResponseWithContext,
} from "@nook/common/types";

const getEntities = (cast: FarcasterCastResponseWithContext) => {
  const entities = [];
  entities.push(cast.entity);
  for (const mention of cast.mentions) {
    entities.push(mention.entity);
  }
  if (cast.parent) {
    entities.push(cast.parent.entity);
  }
  return entities;
};

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
        entityAdapter.addMany(state, getEntities(action.payload));
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.getCastReplies.matchFulfilled,
      (state, action) => {
        entityAdapter.addMany(
          state,
          action.payload.data.flatMap((c) => getEntities(c)),
        );
      },
    );
    builder.addMatcher(
      farcasterApi.endpoints.getFeed.matchFulfilled,
      (state, action) => {
        entityAdapter.addMany(
          state,
          action.payload.data.flatMap((c) => getEntities(c)),
        );
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
