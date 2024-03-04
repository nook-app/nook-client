import { configureStore } from "@reduxjs/toolkit";
import { userApi } from "./apis/userApi";
import { nookApi } from "./apis/nookApi";
import { farcasterApi } from "./apis/farcasterApi";
import navigatorReducer from "./slices/navigator";
import castReducer from "./slices/cast";
import userReducer from "./slices/user";
import entityReducer from "./slices/entity";
import nookReducer from "./slices/nook";
import channelReducer from "./slices/channel";
import contentReducer from "./slices/content";

export const store = configureStore({
  reducer: {
    [userApi.reducerPath]: userApi.reducer,
    [nookApi.reducerPath]: nookApi.reducer,
    [farcasterApi.reducerPath]: farcasterApi.reducer,
    navigator: navigatorReducer,
    casts: castReducer,
    entities: entityReducer,
    user: userReducer,
    nook: nookReducer,
    channel: channelReducer,
    content: contentReducer,
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
