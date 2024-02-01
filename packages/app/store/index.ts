import { configureStore } from "@reduxjs/toolkit";
import { feeds } from "./feeds";

export const store = configureStore({
  reducer: {
    [feeds.reducerPath]: feeds.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(feeds.middleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
