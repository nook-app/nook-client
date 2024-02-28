import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "./apis/userApi";
import { nookApi } from "./apis/nookApi";
import { farcasterApi } from "./apis/farcasterApi";
import navigatorReducer from "./slices/navigator";
import contentReducer from "./slices/cast";
import userReducer from "./slices/user";
import entityReducer from "./slices/entity";
import nookReducer from "./slices/nook";
import channelReducer from "./slices/channel";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [nookApi.reducerPath]: nookApi.reducer,
    [farcasterApi.reducerPath]: farcasterApi.reducer,
    navigator: navigatorReducer,
    content: contentReducer,
    entities: entityReducer,
    user: userReducer,
    nook: nookReducer,
    channel: channelReducer,
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
