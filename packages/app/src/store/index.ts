import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "./apis/userApi";
import { nookApi } from "./apis/nookApi";
import { farcasterApi } from "./apis/farcasterApi";
import drawerReducer from "./slices/drawer";
import contentReducer from "./slices/content";
import userReducer from "./slices/user";
import entityReducer from "./slices/entity";
import nookReducer from "./slices/nook";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [nookApi.reducerPath]: nookApi.reducer,
    [farcasterApi.reducerPath]: farcasterApi.reducer,
    drawer: drawerReducer,
    content: contentReducer,
    entities: entityReducer,
    user: userReducer,
    nook: nookReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      thunk: {
        extraArgument: { userApi, nookApi, farcasterApi },
      },
      serializableCheck: false,
    })
      .concat(userApi.middleware)
      .concat(nookApi.middleware)
      .concat(farcasterApi.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
