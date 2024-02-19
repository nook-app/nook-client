import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import { RootState } from "..";
import { Nook } from "@flink/common/types";
import { userApi } from "../apis/userApi";
import { nookApi } from "../apis/nookApi";

const nookAdapter = createEntityAdapter({
  selectId: (nook: Nook) => nook.nookId,
});

const nookSlice = createSlice({
  name: "nook",
  initialState: nookAdapter.getInitialState(),
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      userApi.endpoints.getUser.matchFulfilled,
      (state, action) => {
        nookAdapter.addMany(state, action.payload.nooks);
      },
    );
    builder.addMatcher(
      nookApi.endpoints.getNook.matchFulfilled,
      (state, action) => {
        if (action.payload) {
          nookAdapter.addOne(state, action.payload);
        }
      },
    );
  },
});

export const { selectById: selectNookById } = nookAdapter.getSelectors(
  (state: RootState) => state.nook,
);

export default nookSlice.reducer;
